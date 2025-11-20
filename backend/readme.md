# Express + MongoDB (MVC) — JWT auth, Zod, image upload, RBAC

## Features
- User model: `fullName`, `email`, `password`, `profile` (photo, dateOfBirth, address, maritalStatus, currentLocation, phone)
- Modern routing with Express Router (ES modules)
- JWT authentication; protect routes
- Zod input validation
- Image upload with multer + sharp, saved to `src/uploads/` (max 5MB, png/jpg/jpeg)
- RBAC: admin seeded from `.env` (singleton). Admin can list users, block/unblock, delete user permanently.
- Admin block sets `isBlocked` and `blockedReason`; blocked users cannot log in and receive the reason.

## Setup (VS Code)
1. Clone / create project folder and paste files from this repo.
2. Install dependencies:
   ```bash
   npm install


Run locally:
npm run dev
or
npm start


API endpoints:
POST /api/auth/register body: { fullName, email, password }
POST /api/auth/login body: { email, password }
GET /api/users/me (Auth header)
PUT /api/users/me (Auth header, multipart/form-data; optional photo file field to upload image)
DELETE /api/users/me (Auth header)

Admin (requires admin user token):
GET /api/users/
PATCH /api/users/:id/block body: { reason }
PATCH /api/users/:id/unblock
DELETE /api/users/:id

Notes
Uploaded images are available at http://localhost:4000/uploads/<filename>.
The app seeds a single admin (email/password from .env) at startup if it doesn't exist.
For production: use HTTPS, rotate JWT secrets, use persistent file storage (S3) or database for images, rate-limiting, helmet, CORS config, input sanitization beyond Zod, etc.