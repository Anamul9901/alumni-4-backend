# AppointX - Smart Appointment Management System

AppointX is a robust backend system designed for managing smart appointments, staff scheduling, and automated queue management. It features intelligent conflict detection, strict role-based validation, and a dynamic waiting queue system.

## 🚀 Live Links
- **Frontend:** [https://appointx-eta.vercel.app/](https://appointx-eta.vercel.app/)
- **Backend:** [https://appointx-ten.vercel.app/](https://appointx-ten.vercel.app/)

## ✨ Key Features
- **Smart Appointment Booking**: Automated conflict detection prevents double-booking.
- **Role-Based Validation**: Ensures appointments are assigned only to staff with the correct role (e.g., Surgery -> Surgeon).
- **Automated Queue Management**: FIFO queue with "Smart Assign" to automatically match patients with the next available eligible staff.
- **Staff Management**: Manage daily capacity, roles, and availability.
- **Dashboard Analytics**: Real-time stats on staff load and queue status.

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Language**: TypeScript
- **Validation**: Zod
- **Authentication**: JWT

## 📦 Installation & Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anamul9901/PH-Alumni-Task-Smart-Appointment-Backend.git
   cd alumni-backend
   ```

2. **Install Dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=your_mongodb_url
   BCRYPT_SALT_ROUNDS=12
   JWT_ACCESS_SECRET=your_jwt_secret
   ```

4. **Run Locally**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

## 🔗 API Documentation
- **Staff Roles**: `GET /api/staff/roles`
- **Appointments**: `POST /api/appointment`, `GET /api/appointment`
- **Queue**: `POST /api/appointment/assign-queue`

---
*Built for the PH Alumni Task - Smart Appointment Backend*
