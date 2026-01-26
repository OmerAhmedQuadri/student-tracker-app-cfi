# Student Tracker App (CFI)

A comprehensive student tracking and management system designed for educational institutions. This application facilitates seamless interaction between Admins, Mentors, and Students, tracking attendance, assignments, and curriculum progress.

## 🌟 Features

### 🎓 Student Features
- **Dashboard**: View attendance stats, upcoming sessions, and recent activity.
- **Attendance**: Track daily attendance and view history.
- **Curriculum**: Access learning materials and batch milestones.
- **Assignments**: View and submit assignments.
- **Leaderboard**: Compete with peers based on engagement and performance.

### 👨‍🏫 Mentor Features
- **Batch Management**: View and manage assigned batches.
- **Student Oversight**: Monitor student progress and attendance.
- **Assignments**: Create and grade assignments.
- **Session Scheduling**: Schedule and manage mentorship sessions.

### 🛡️ Admin Features
- **User Management**: Create and manage Students, Mentors, and Admins.
- **Batch & Curriculum**: Define batches, skills, and curriculum structures.
- **Reports & Analytics**: High-level overview of institution performance.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT-based auth (Cookies)

## 🚀 Build and Setup Instructions

Follow these steps to build and set up the application from scratch:

1.  **Build the Client:**
    Navigate to the client directory, install dependencies, and build the project.
    ```bash
    cd client
    pnpm i
    touch .env 
    pnpm build
    ```

2.  **Move Build Artifacts:**
    Move the generated `dist` folder to the server's source directory.
    ```bash
    mv dist ../server/src
    ```

3.  **Setup the Server:**
    Navigate to the server directory, install dependencies, and create the environment file.
    ```bash
    cd ..
    cd server
    pnpm i
    touch .env
    ```

4.  **Configure Environment:**
    Open the `.env` file in the `server` directory and add the necessary environment variables (PORT, MONGO_URI, JWT_SECRET, etc.).

5.  **Start the Server:**
    ```bash
    npm run dev
    # or
    npm start
    ```