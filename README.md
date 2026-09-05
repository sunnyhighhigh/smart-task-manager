# Smart Task Manager (Paraprofessional Edition)

A full-stack task management application tailored for tracking daily paraprofessional tasks, complete with Oracle Database backend and a modern React glassmorphism frontend.

## 🚀 Features
- **User Authentication:** Secure JWT-based registration and login.
- **Paraprofessional Fields:** Custom tracking for School District, School Name, Start/Stop Times, and Lunch Breaks.
- **Modern UI:** Premium glassmorphism aesthetic built with Vite & React.
- **Oracle DB Backend:** Enterprise-grade database schema with auto-incrementing identity columns, constraints, and indexed searches.
- **CI/CD Pipeline:** Fully automated GitHub Actions workflow for testing and validation.

## 🛠️ Architecture
- **Frontend:** React (Vite), Axios, React Router, Lucide Icons, Vanilla CSS (Glassmorphism).
- **Backend:** Node.js, Express, `oracledb`, `bcrypt`, `jsonwebtoken`, Jest.
- **Database:** Oracle Database 21c/23ai XE.

## 📦 Setup Instructions

### 1. Database Setup (Oracle SQL Developer)
1. Open Oracle SQL Developer and connect to your local XE instance.
2. Open the file located at `db/create_schema.sql`.
3. Run the script to generate the `USERS` and `TASKS` tables and their associated constraints.

### 2. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Configure Environment Variables:
   - Rename `.env.example` to `.env` (or create a `.env` file).
   - Fill in your Oracle DB credentials:
     ```env
     DB_USER=SYSTEM
     DB_PASSWORD=your_oracle_password
     DB_CONNECTION_STRING=localhost:1521/XE
     JWT_SECRET=your_secret_key
     ```
4. Start the server: `npm run dev`

### 3. Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`

## 🔄 CI/CD & Branching Strategy
- **Branching Strategy:** The project utilizes a strict branching model where `main` is protected as the production-ready code. Active development occurs on `dev` or `feature/*` branches, which are merged via Pull Requests.
- **Pipeline Stages (`.github/workflows/ci.yml`):** 
  1. **Continuous Integration (CI):** The `build-and-test` stage automatically triggers on all pushes. It provisions a Node.js 20.x cloud server, installs dependencies, and executes Jest API unit tests to prevent broken code from being merged.
  2. **Continuous Deployment (CD):** Once the CI stage passes, the `deploy` stage activates exclusively on the `main` branch, securely pulling Oracle Database credentials from GitHub Secrets to automate the production release.

## 🤖 AI Prompt Engineering Log
*(To be filled by student for assignment submission)*
1. **Original Prompt:** ...
2. **AI Response:** ...
3. **Issues Found:** ...
4. **Improved Prompt:** ...
5. **Final Solution:** ...
