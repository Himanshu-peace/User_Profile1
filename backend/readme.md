Project Overview
This project is a secure user management backend built with:
Express.js
MongoDB + Mongoose
JWT Authentication
Role-Based Access Control (RBAC)
Multer + Sharp for image upload & compression
Morgan for HTTP logging
Joi validation for all incoming user data
It follows a clean MVC architecture, and exposes API routes for:
Authentication
User account management
Admin account management

🚀 Features
🔐 Authentication

Register with profile photo upload (PNG, JPG, JPEG ≤ 5MB)

Login with JWT token generation

Token-protected routes using authentication middleware

👤 User Management
Feature	Method	Route
Get own profile	GET	/api/users/me
Update full profile	PUT	/api/users/:id
Update partial profile	PATCH	/api/users/:id
Update password	PATCH	/api/users/:id/password
Deactivate account	PATCH	/api/users/:id/deactivate
Restore account	PATCH	/api/users/:id/restore
Delete account (soft delete or permanent based on role)	DELETE	/api/users/:id

✔ Supports compressed image storage using Sharp
✔ Validated with Joi (updateUserSchema, fullUpdateUserSchema)

🛡 Admin Management (RBAC)

Admins can manage users (non-admin accounts only):

Feature	Method	Route
Get all users	GET	/api/admin/users
Block user	PATCH	/api/admin/block/:id
Unblock user	PATCH	/api/admin/unblock/:id
Update own admin profile	PATCH	/api/admin/me
Update any user's profile	PATCH	/api/admin/user/:id
Delete any user permanently	DELETE	/api/admin/user/:id
🧪 Validation (Joi)

Validation is implemented through:

/validators
 ├─ authValidator.js
 └─ userValidators.js


Used to validate:

Action	Schema
Register	registerSchema
Login	loginSchema
Update profile (full)	fullUpdateUserSchema
Update profile (partial)	updateUserSchema
Update password	updatePasswordSchema (if implemented)

All validation errors return structured JSON responses for debugging.

📦 Technologies Used
Tool/Library	Purpose
Express.js	Backend routing
MongoDB + Mongoose	Database + ODM
JWT	Authentication
Joi	Validation
Multer + Sharp	File upload + compression
Morgan	Request logging
bcryptjs	Password hashing
dotenv	Environment variables
📁 Project Structure
/controllers
/models
/routes
/validators
/middlewares
/uploads


Follows clean MVC separation with reusable middleware.

🛠 Setup & Run
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start server
npm run dev


Server runs at:
http://localhost:5000

📬 API Testing
A full Postman collection is included with:
Token auto-handling
User/Admin route separation
File upload support

Summary
Category	Status
MVC Architecture	✔ Completed
JWT Auth + Refresh Ready	✔ Implemented
RBAC (Admin/User)	✔ Fully implemented
Multer + Sharp processing	✔ Enabled
Joi validation on all endpoints	✔ Enforced
Admin CRUD over users	✔ Complete
