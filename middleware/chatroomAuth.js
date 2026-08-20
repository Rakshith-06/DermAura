/**
 * middleware/chatroomAuth.js
 * ─────────────────────────────────────────────────────────────────────────────
 * DermAura Chatroom Access-Control Layer
 *
 * Exports:
 *   authenticateToken       – Verifies JWT and attaches decoded user to req.user
 *   requireRole(roles)      – Route guard: only allows users with matching roles
 *   checkChatroomAccess     – Validates chatroom participants (1 Patient + ≥1 Doctor).
 *                             Blocks doctor-to-doctor direct messaging in patient rooms.
 *   socketAuthMiddleware    – Socket.io auth handshake (attaches user to socket)
 *   guardSocketMessage      – Socket.io SEND_MESSAGE event guard
 * ─────────────────────────────────────────────────────────────────────────────
 */

import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import ChatRoom from '../models/ChatRoom.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sih_dermaura_hackathon_secret_2026';

// ─── Helper: Resolve user role from MongoDB or JWT payload ───────────────────
const resolveUserRole = async (userId) => {
  // Prefer database truth over token claim to prevent privilege escalation
  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
    const user = await User.findById(userId).select('role').lean();
    return user?.role ?? null;
  }
  return null; // Caller must fall back to JWT role claim
};

// ─── 1. JWT Authentication Middleware ─────────────────────────────────────────
/**
 * Verifies Bearer token, decodes it, and attaches `req.user` with:
 *   { id, email, role, fullName }
 *
 * Falls back gracefully when MongoDB is unavailable (demo mode):
 * the role embedded in the JWT is used as-is but flagged as unverified.
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
        code: 'NO_TOKEN',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === 'TokenExpiredError'
          ? 'Session expired. Please log in again.'
          : 'Invalid authentication token.',
        code: 'INVALID_TOKEN',
      });
    }

    // Cross-check role with database for higher assurance
    const dbRole = await resolveUserRole(decoded.id);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: dbRole ?? decoded.role,   // DB role wins if available
      fullName: decoded.fullName,
      roleVerifiedByDB: dbRole !== null,
    };

    next();
  } catch (err) {
    console.error('[chatroomAuth] authenticateToken error:', err.message);
    return res.status(500).json({ success: false, message: 'Authentication service error.' });
  }
};

// ─── 2. Role Guard Middleware Factory ─────────────────────────────────────────
/**
 * Usage: router.get('/route', authenticateToken, requireRole(['doctor']), handler)
 *
 * @param {string[]} allowedRoles  – e.g. ['doctor'] or ['patient', 'doctor']
 */
export const requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.', code: 'NOT_AUTHENTICATED' });
  }

  const userRole = (req.user.role || '').toLowerCase();
  const allowed  = allowedRoles.map((r) => r.toLowerCase());

  if (!allowed.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. This route is restricted to: ${allowedRoles.join(', ')}.`,
      code: 'FORBIDDEN_ROLE',
      yourRole: userRole,
    });
  }

  next();
};

// ─── 3. Chatroom Access & Isolation Middleware ────────────────────────────────
/**
 * Enforces the invariant:
 *   A chatroom MUST consist of exactly one Patient and one or more Doctors.
 *
 * Usage: router.post('/chat/:chatroomId/message', authenticateToken, checkChatroomAccess, handler)
 *
 * Attaches `req.chatroom` and `req.chatroomParticipants` for downstream handlers.
 *
 * Blocks with 403 if:
 *   - The chatroom's patientId resolves to a non-patient role
 *   - The requesting user (doctor) is attempting to message another doctor
 *     directly inside a patient consultation room
 */
export const checkChatroomAccess = async (req, res, next) => {
  try {
    const chatroomId = req.params.chatroomId || req.body.chatroomId;

    if (!chatroomId) {
      return res.status(400).json({
        success: false,
        message: 'chatroomId is required.',
        code: 'MISSING_CHATROOM_ID',
      });
    }

    // ── Fetch chatroom ────────────────────────────────────────────────────────
    let chatroom = null;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(chatroomId)) {
      chatroom = await ChatRoom.findById(chatroomId)
        .populate('patientId', 'role fullName email')
        .populate('doctorId',  'role fullName email')
        .lean();
    }

    if (!chatroom) {
      // Demo mode: skip DB validation but still enforce role-based isolation
      if (req.user.role === 'doctor') {
        const recipientRole = (req.body.recipientRole || '').toLowerCase();
        if (recipientRole === 'doctor') {
          return res.status(403).json({
            success: false,
            message: 'Doctor-to-Doctor direct chat is disabled in patient rooms.',
            code: 'D2D_BLOCKED',
          });
        }
      }
      return next(); // Allow (demo mode, no DB to verify against)
    }

    // ── Verify chatroom has exactly ONE patient ───────────────────────────────
    const patient = chatroom.patientId;
    if (!patient || patient.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Chatroom integrity violation: Patient slot does not hold a valid patient account.',
        code: 'INVALID_PATIENT_SLOT',
      });
    }

    // ── Verify assigned doctor slot holds a doctor role ───────────────────────
    const assignedDoctor = chatroom.doctorId;
    if (!assignedDoctor || assignedDoctor.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Chatroom integrity violation: Doctor slot does not hold a valid doctor account.',
        code: 'INVALID_DOCTOR_SLOT',
      });
    }

    // ── Block doctor-to-doctor direct messaging ───────────────────────────────
    if (req.user.role === 'doctor') {
      const recipientId   = req.body.recipientId;
      const recipientRole = (req.body.recipientRole || '').toLowerCase();

      // If a recipientId is supplied, resolve its true role from DB
      let resolvedRecipientRole = recipientRole;
      if (recipientId && mongoose.Types.ObjectId.isValid(recipientId)) {
        resolvedRecipientRole = (await resolveUserRole(recipientId)) ?? recipientRole;
      }

      if (resolvedRecipientRole === 'doctor') {
        return res.status(403).json({
          success: false,
          message: 'Doctor-to-Doctor direct chat is disabled in patient rooms.',
          code: 'D2D_BLOCKED',
        });
      }

      // Confirm requesting doctor is actually assigned to this chatroom
      const isAssigned = assignedDoctor._id.toString() === req.user.id;
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this patient chatroom.',
          code: 'DOCTOR_NOT_ASSIGNED',
        });
      }
    }

    // ── Confirm requesting patient is the chatroom patient ────────────────────
    if (req.user.role === 'patient') {
      const isRoomOwner = patient._id.toString() === req.user.id;
      if (!isRoomOwner) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to access this consultation room.',
          code: 'PATIENT_NOT_AUTHORIZED',
        });
      }
    }

    // ── Attach validated context for downstream handlers ──────────────────────
    req.chatroom = chatroom;
    req.chatroomParticipants = { patient, doctor: assignedDoctor };
    next();

  } catch (err) {
    console.error('[chatroomAuth] checkChatroomAccess error:', err.message);
    return res.status(500).json({ success: false, message: 'Chatroom access validation error.' });
  }
};

// ─── 4. Socket.io Authentication Handshake ───────────────────────────────────
/**
 * Attach to Socket.io server:
 *   io.use(socketAuthMiddleware);
 *
 * Reads token from: socket.handshake.auth.token  OR  socket.handshake.query.token
 * On success: attaches `socket.user = { id, email, role, fullName }` and calls next().
 * On failure: calls next(new Error('Authentication error')) — disconnects socket.
 */
export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token =
      socket.handshake?.auth?.token ||
      socket.handshake?.query?.token ||
      null;

    if (!token) {
      return next(new Error('Socket authentication failed: No token provided.'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return next(new Error('Socket authentication failed: Invalid or expired token.'));
    }

    const dbRole = await resolveUserRole(decoded.id);
    socket.user = {
      id: decoded.id,
      email: decoded.email,
      role: dbRole ?? decoded.role,
      fullName: decoded.fullName,
    };

    next();
  } catch (err) {
    console.error('[chatroomAuth] socketAuthMiddleware error:', err.message);
    next(new Error('Socket authentication service error.'));
  }
};

// ─── 5. Socket.io SEND_MESSAGE Guard ─────────────────────────────────────────
/**
 * Call this inside your `socket.on('SEND_MESSAGE', ...)` handler
 * BEFORE processing the message.
 *
 * @param {object} socket   – The Socket.io socket (must have socket.user set)
 * @param {object} payload  – The SEND_MESSAGE event payload
 *   Expected shape:
 *   {
 *     chatroomId:    string,
 *     recipientId:   string,   // ID of the intended message recipient
 *     recipientRole: string,   // 'patient' | 'doctor'  (client-reported; cross-checked)
 *     text:          string,
 *     type:          string,   // 'text' | 'proposed_rx' | 'system_notification' | etc.
 *   }
 *
 * @returns {{ allowed: boolean, code?: string, message?: string }}
 */
export const guardSocketMessage = async (socket, payload) => {
  const senderRole = (socket.user?.role || '').toLowerCase();

  // ── (A) System notifications must never originate from doctor accounts ──────
  // They must be emitted server-side only and rendered as system badges.
  if (payload.type === 'system_notification' && senderRole === 'doctor') {
    return {
      allowed: false,
      code: 'SYSTEM_NOTIFICATION_BLOCKED',
      message: 'System notifications must be emitted server-side, not from doctor accounts.',
    };
  }

  // ── (B) Doctor-to-Doctor block inside patient consultation rooms ─────────────
  if (senderRole === 'doctor') {
    // Resolve recipient role – trust DB over client claim
    let resolvedRecipientRole = (payload.recipientRole || '').toLowerCase();

    if (payload.recipientId && mongoose.Types.ObjectId.isValid(payload.recipientId)) {
      if (mongoose.connection.readyState === 1) {
        const recipient = await User.findById(payload.recipientId).select('role').lean();
        if (recipient?.role) {
          resolvedRecipientRole = recipient.role.toLowerCase();
        }
      }
    }

    if (resolvedRecipientRole === 'doctor') {
      return {
        allowed: false,
        code: 'D2D_BLOCKED',
        message: 'Doctor-to-Doctor direct chat is disabled in patient rooms.',
        httpStatus: 403,
      };
    }
  }

  // ── (C) Validate message text is non-empty ────────────────────────────────
  if (!payload.text?.trim()) {
    return {
      allowed: false,
      code: 'EMPTY_MESSAGE',
      message: 'Message text cannot be empty.',
    };
  }

  return { allowed: true };
};
