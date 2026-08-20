import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import medicationRoutes from './routes/medicationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { startCronWorker } from './cronWorker.js';
import { socketAuthMiddleware, guardSocketMessage } from './middleware/chatroomAuth.js';

const app = express();
const httpServer = http.createServer(app);

// ── Socket.io Server ─────────────────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',').concat(process.env.FRONTEND_URL || []).includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Socket: Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
  },
});

// Attach io to app so route handlers can emit events via req.app.get('io')
app.set('io', io);

// JWT authentication handshake for all socket connections
io.use(socketAuthMiddleware);

io.on('connection', (socket) => {
  const { fullName, role, id } = socket.user || {};
  console.log(`✅ Socket connected: ${fullName} [${role}] (id: ${id})`);

  // ── Doctors join their personal room for direct notifications ──
  if (role === 'doctor') {
    socket.join(`doctor:${id}`);
    console.log(`🏥 Doctor ${fullName} joined room doctor:${id}`);
  }

  // ── Join a shared patient consultation room ────────────────────
  socket.on('JOIN_CONSULT_ROOM', ({ patientId }) => {
    if (patientId) {
      socket.join(`consult:${patientId}`);
      console.log(`[Socket] ${fullName} joined consult:${patientId}`);
    }
  });

  // ── SEND_MESSAGE guard (D2D block from previous PR) ────────────
  socket.on('SEND_MESSAGE', async (payload, ack) => {
    const guard = await guardSocketMessage(socket, payload);
    if (!guard.allowed) {
      if (typeof ack === 'function') ack({ success: false, code: guard.code, message: guard.message });
      console.warn(`[Socket] Blocked SEND_MESSAGE from ${fullName}: ${guard.message}`);
      return;
    }
    const messageEvent = {
      id:         `msg-${Date.now()}`,
      chatroomId: payload.chatroomId,
      senderId:   id,
      senderName: fullName,
      senderRole: role,
      text:       payload.text.trim(),
      type:       payload.type || 'text',
      timestamp:  new Date().toISOString(),
    };
    io.to(payload.chatroomId).emit('NEW_MESSAGE', messageEvent);
    if (typeof ack === 'function') ack({ success: true, message: messageEvent });
  });

  // ── Doctor acknowledges a report (mark as REVIEWED) ───────────
  socket.on('REPORT_REVIEWED', ({ reportId, reportType }) => {
    console.log(`[Socket] Doctor ${fullName} reviewed report ${reportId} (${reportType})`);
    // Optionally emit acknowledgement to the patient
    io.to(`consult:${socket.user?.id}`).emit('REPORT_STATUS_UPDATE', {
      reportId,
      reportType,
      deliveryStatus: 'REVIEWED',
      reviewedBy: fullName,
      reviewedAt: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${fullName} [${role}]`);
  });
});
const PORT = process.env.PORT || 5000;

// Middleware
// ── CORS: Allow localhost in dev and your Vercel domain in production ──────
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL, // set this in Render to your Vercel URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, mobile apps) or whitelisted origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', doctorRoutes); // reuse same router for patient PATCH route
app.use('/api/consultations', consultationRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/reports', reportRoutes);           // ← Automated Health Report Routing

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'DermAura Auth API is running smoothly!' });
});

// Database Connection & Server Start
// For Hackathon local demo without MongoDB installed, fallback gracefully or connect to MongoDB URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dermaura_sih';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB.');
  })
  .catch((err) => {
    console.warn('⚠️  MongoDB connection warning (Running in demo API mode):', err.message);
  });


httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use by an active background process.`);
    console.log(`💡 Run "npx kill-port ${PORT}" or kill node processes in PowerShell before running npm run start.\n`);
    process.exit(1);
  }
});

httpServer.listen(PORT, () => {
  console.log(`🚀 DermAura Backend API server listening on http://localhost:${PORT}`);
  console.log(`📡 Socket.io server active on the same port.`);
  startCronWorker();
});

/*
 * ──────────────────────────────────────────────────────────────────────────────
 * SOCKET.IO INTEGRATION (uncomment when you add socket.io to the project)
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * import { createServer } from 'http';
 * import { Server } from 'socket.io';
 * import { socketAuthMiddleware, guardSocketMessage } from './middleware/chatroomAuth.js';
 *
 * const httpServer = createServer(app);
 * const io = new Server(httpServer, { cors: { origin: '*' } });
 *
 * // ── Step 1: JWT Authentication handshake for every Socket connection ──
 * io.use(socketAuthMiddleware);
 *
 * // ── Step 2: Guard SEND_MESSAGE events against D2D messaging ────────────
 * io.on('connection', (socket) => {
 *   console.log(`✅ Socket connected: ${socket.user.fullName} [${socket.user.role}]`);
 *
 *   socket.on('JOIN_CHATROOM', ({ chatroomId }) => {
 *     socket.join(chatroomId);
 *   });
 *
 *   socket.on('SEND_MESSAGE', async (payload, ack) => {
 *     const guard = await guardSocketMessage(socket, payload);
 *
 *     if (!guard.allowed) {
 *       // Surface 403 back to the emitting client
 *       if (typeof ack === 'function') {
 *         ack({ success: false, code: guard.code, message: guard.message });
 *       }
 *       console.warn(
 *         `[Socket] Blocked SEND_MESSAGE from ${socket.user.fullName}: ${guard.message}`
 *       );
 *       return;
 *     }
 *
 *     // ── Broadcast to chatroom participants ──────────────────────────
 *     const messageEvent = {
 *       id: `msg-${Date.now()}`,
 *       chatroomId: payload.chatroomId,
 *       senderId: socket.user.id,
 *       senderName: socket.user.fullName,
 *       senderRole: socket.user.role,
 *       text: payload.text.trim(),
 *       type: payload.type || 'text',
 *       timestamp: new Date().toISOString(),
 *     };
 *
 *     io.to(payload.chatroomId).emit('NEW_MESSAGE', messageEvent);
 *     if (typeof ack === 'function') ack({ success: true, message: messageEvent });
 *   });
 *
 *   // ── CARE HANDOFF: emitted SERVER-SIDE as a system badge, never from client ──
 *   // To trigger a care handoff notification:
 *   //   io.to(chatroomId).emit('SYSTEM_NOTIFICATION', { type: 'CARE_HANDOFF', text: '...' });
 *
 *   socket.on('disconnect', () => {
 *     console.log(`Socket disconnected: ${socket.user?.fullName}`);
 *   });
 * });
 *
 * // Replace `app.listen(...)` call above with:
 * // httpServer.listen(PORT, () => { ... });
 * ────────────────────────────────────────────────────────────────────────────── */
