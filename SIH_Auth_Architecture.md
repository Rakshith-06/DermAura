# DermAura - Smart India Hackathon (SIH) Healthcare Auth Architecture

## 1. Hackathon Recommended Tech Stack

| Layer | Recommended Technology | Hackathon Justification |
| :--- | :--- | :--- |
| **Frontend UI** | **React.js (Vite) + Tailwind CSS** | Blazing-fast page loads, instant hot-reloading, beautiful pre-designed utility classes perfect for UI scoring. |
| **Icons & Motion** | **Lucide-React + Framer Motion** | Professional healthcare icon set + smooth transition animations for jury presentation impact. |
| **Backend API** | **Node.js + Express.js** | Rapid REST API development, flexible middleware ecosystem, high throughput for mock demo traffic. |
| **Database** | **MongoDB (Mongoose ODM)** | Flexible document schema accommodates heterogeneous medical records (Patient vs. Doctor data models) effortlessly. |
| **Auth & Security**| **JWT (JSON Web Tokens) + Bcrypt.js** | Stateless RBAC authentication with encrypted password storage. |

---

## 2. Data Schemas

### A. MongoDB Document Schemas (Mongoose)

```javascript
// Base User Discriminator Schema
const BaseUserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['patient', 'doctor'], required: true },
}, { timestamps: true });

// Patient Discriminator Schema
const PatientSchema = new mongoose.Schema({
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], required: true },
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true }
  },
  medicalHistory: {
    bloodGroup: { type: String, default: 'Unknown' },
    allergies: [{ type: String }],
    chronicIllnesses: [{ type: String }]
  }
});

// Doctor Discriminator Schema
const DoctorSchema = new mongoose.Schema({
  licenseNumber: { type: String, required: true, unique: true },
  qualifications: { type: String, required: true }, // e.g. "MBBS, MD (Dermatology)"
  specialization: { type: String, required: true },
  hospitalAffiliation: {
    name: { type: String, required: true },
    address: { type: String, required: true }
  },
  yearsOfExperience: { type: Number, required: true },
  isVerified: { type: Boolean, default: false } // Medical board verification state
});
```

### B. Relational Schema (PostgreSQL DDL Alternative)

```sql
CREATE TYPE user_role AS ENUM ('patient', 'doctor');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL,
    emergency_contact_name VARCHAR(150) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    emergency_contact_relation VARCHAR(50) NOT NULL,
    blood_group VARCHAR(5) DEFAULT 'N/A',
    allergies TEXT[],
    chronic_illnesses TEXT[]
);

CREATE TABLE doctors (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    qualifications VARCHAR(255) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    hospital_address TEXT NOT NULL,
    years_of_experience INT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE
);
```

---

## 3. Core API Endpoints

### 1. `POST /api/auth/register/patient`
- **Request Body**:
```json
{
  "fullName": "Aarav Sharma",
  "email": "aarav@gmail.com",
  "phone": "+919876543210",
  "password": "SecurePassword123!",
  "age": 28,
  "gender": "Male",
  "emergencyContact": {
    "name": "Ramesh Sharma",
    "relationship": "Father",
    "phone": "+919876543211"
  },
  "medicalHistory": {
    "bloodGroup": "O+",
    "allergies": ["Penicillin"],
    "chronicIllnesses": ["Asthma"]
  }
}
```

### 2. `POST /api/auth/register/doctor`
- **Request Body**:
```json
{
  "fullName": "Dr. Sarah Jenkins",
  "email": "dr.sarah@aiims.edu.in",
  "phone": "+919812345678",
  "password": "DoctorSecretKey456!",
  "licenseNumber": "MCI-98421-B",
  "qualifications": "MBBS, MD (Dermatology)",
  "specialization": "Dermatology",
  "hospitalAffiliation": {
    "name": "AIIMS Hospital",
    "address": "Ansari Nagar, New Delhi"
  },
  "yearsOfExperience": 9
}
```

### 3. `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "dr.sarah@aiims.edu.in",
  "password": "DoctorSecretKey456!",
  "expectedRole": "doctor"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged in successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65cb...a91",
    "fullName": "Dr. Sarah Jenkins",
    "email": "dr.sarah@aiims.edu.in",
    "role": "doctor",
    "isVerified": false
  }
}
```

---

## 4. Form Validation & Security Checklist

1. **Password Encryption**:
   - Always hash passwords using `bcrypt.hash(password, 12)` before saving to DB.
   - Set `{ select: false }` on password field in Mongoose queries.

2. **Role Isolation & Authorization**:
   - Store role (`patient` or `doctor`) inside signed JWT payload.
   - Enforce Express middleware:
     ```javascript
     const authorizeRoles = (...allowedRoles) => (req, res, next) => {
       if (!allowedRoles.includes(req.user.role)) {
         return res.status(403).json({ message: 'Access denied.' });
       }
       next();
     };
     ```

3. **Medical License Sanitization**:
   - Sanitize doctor medical license input to uppercase strings (`trim()` + `toUpperCase()`).
   - Validate format against state/national medical registry regex (e.g. `^[A-Z]{2,3}-[0-9]{5}-[A-Z0-9]+$`).

4. **Rate Limiting & Input Sanitization**:
   - Implement `express-rate-limit` on `/api/auth/*` endpoints (e.g. max 5 login requests per minute per IP to prevent brute force).
   - Use `express-validator` or `zod` schema parser on request payloads.
