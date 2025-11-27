# PPP LMS Backend

This is a Node + Express + MongoDB (Mongoose) backend for the PPP LMS project with complete authentication, user management, and admin student management.

## Quick Start

### 1. Setup Environment

Copy `.env.example` to `.env` and update with your MongoDB Atlas connection string and JWT secret:

```powershell
$content = Get-Content .env.example
Set-Content .env $content
# Edit .env with your values
```

### 2. Install Dependencies

```powershell
cd backend
npm install
```

### 3. Seed Demo Data

This creates demo credentials in your MongoDB Atlas database:

```powershell
npm run seed
```

Demo credentials:
- **Admin**: admin@gmail.com / admin
- **Student**: student@gmail.com / student

### 4. Run Server

**Development mode** (with auto-reload):
```powershell
npm run dev
```

**Production mode**:
```powershell
npm start
```

Server runs on http://localhost:5000

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/register` | No | Register new user (returns JWT token) |
| POST | `/login` | No | Login user (returns JWT token) |
| GET | `/me` | Yes | Get current user profile |

**Register/Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "student|admin",
    "phone": "...",
    "nic": "...",
    "badge": "..."
  }
}
```

### User Settings (`/api/users`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/profile` | Yes | Get user profile |
| PUT | `/profile` | Yes | Update profile (name, phone, nic, address, badge) |
| POST | `/change-password` | Yes | Change password |

**Change Password Request:**
```json
{
  "currentPassword": "old_pass",
  "newPassword": "new_pass",
  "confirmPassword": "new_pass"
}
```

### Admin Student Management (`/api/admin/students`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/` | Yes | List all students |
| POST | `/` | Yes | Create new student |
| GET | `/:id` | Yes | Get student by ID |
| PUT | `/:id` | Yes | Update student |
| DELETE | `/:id` | Yes | Delete student |

**Create/Update Student Request:**
```json
{
  "name": "Kasun Perera",
  "email": "kasun@example.com",
  "password": "password123",
  "phone": "+94 71 234 5678",
  "nic": "199512345678",
  "badge": "Gold",
  "address": "123 Main St"
}
```

### Classes (`/api/classes`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/` | No | List all classes |
| POST | `/` | Yes | Create class |
| GET | `/:id` | No | Get class by ID |
| PUT | `/:id` | Yes | Update class |
| DELETE | `/:id` | Yes | Delete class |

---

## Authentication

All protected endpoints require Bearer token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Database Schema

### User
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `role` (String: 'student', 'teacher', 'admin')
- `phone` (String, optional)
- `nic` (String, optional)
- `badge` (String, optional)
- `address` (String, optional)
- `createdAt` (Date)

### Class
- `title` (String, required)
- `description` (String)
- `teacher` (ObjectId, ref: User)
- `students` (Array of ObjectIds, ref: User)
- `createdAt` (Date)

---

## Environment Variables

```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/ppp-lms
JWT_SECRET=your-super-secret-key-min-32-chars-recommended
PORT=5000
```

---

## Notes

- Passwords are hashed using bcryptjs before storage
- JWTs expire after 7 days
- All responses include a `success` boolean field
- Error responses include a `message` field
- Admin role check can be added to `/api/admin/*` routes as needed

---

## Troubleshooting

**MongoDB Connection Error**: Check your `MONGO_URI` in `.env`
**JWT Error**: Ensure `JWT_SECRET` is set and matches frontend
**Port Already in Use**: Change `PORT` in `.env`


