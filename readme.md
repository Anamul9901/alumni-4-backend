# AppointX - Smart Appointment & Workspace Management System (Backend API)

AppointX Backend is a robust, production-ready REST API built with Node.js, Express, TypeScript, and MongoDB. It powers smart appointments management, staff workloads, automated queuing, activity logs auditing, and workspace project permissions.

---

## 🚀 Live Links

- **Backend API URL**: [https://appointx-ten.vercel.app/](https://appointx-ten.vercel.app/)
- **Frontend App URL**: [https://appointx-eta.vercel.app/](https://appointx-eta.vercel.app/)

---

## ✨ Features Overview

- **Smart Appointment Auto-Assign**: FIFO (First-In, First-Out) queuing architecture matching walk-in patients to the next eligible staff member automatically based on schedules and capacity limits.
- **Strict Role-Based Validation**: Access control structures checking JWT signatures and verifying specific credentials (Admin vs. Project Manager vs. Team Member) for all CRUD endpoints.
- **Comprehensive Activity Logging**: Automatically audits database modifications (creating/deleting projects, updating task statuses, sending attachments, posting comments) and structures logs for active feeds.
- **Reliable TS Architecture**: Written entirely in TypeScript with strict compile parameters, custom error interfaces, and validation schemas managed via Zod.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory to store configuration variables:

```env
# Server Environment Setup
NODE_ENV=development
PORT=5001

# Database Configuration
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/database-name

# Authentication Settings
BCRYPT_SALT_ROUNDS=12
JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=10d
JWT_REFRESH_EXPIRES_IN=365d
```

---

## 🔑 Seeded Demo Credentials

The database contains seeded user accounts matching these roles:

- **Admin Account**:
  - Email: `admin@appointx.com`
  - Password: `Admin@123`
- **Manager Account**:
  - Email: `manager@appointx.com`
  - Password: `Manager@123`
- **Team Member Account**:
  - Email: `member@appointx.com`
  - Password: `Member@123`

---

## 🛠️ Project Setup Instructions

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB Instance** (Local MongoDB Community Server or MongoDB Atlas cloud cluster)
- **npm** or **yarn**

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anamul9901/PH-Alumni-Task-Smart-Appointment-Backend.git
   cd alumni-backend
   ```

2. **Install all dependencies**
   ```bash
   npm install
   # or if using yarn:
   yarn install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and specify your `DATABASE_URL` and secrets:
   ```bash
   touch .env
   # Populate variables as defined in the Environment Variables section
   ```

4. **Compile TypeScript & Run in Development**
   ```bash
   npm run dev
   # or if using yarn:
   yarn dev
   ```

5. **Build and Run Production Bundle**
   ```bash
   npm run build
   npm start
   ```

---

## 📦 Deployment Instructions

The backend API is configured with `vercel.json` and can be deployed directly to **Vercel** or **Render**.

### Deploying to Vercel

1. **Install Vercel CLI (Optional)**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:
   Run the following command in the root folder:
   ```bash
   vercel
   ```

3. **Configure Environment Variables**:
   Specify `DATABASE_URL`, `JWT_ACCESS_SECRET`, etc. within your Vercel Dashboard under **Project Settings -> Environment Variables**.

4. **Production Build Hook**:
   Vercel will build the TypeScript project using the `build` script in `package.json` and serve serverless functions according to `vercel.json`.
