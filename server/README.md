# Student Tracker Backend

This is the backend server for the Student Tracker Application, built with Node.js, Express, and MongoDB.

## 📂 Folder Structure

```
server/
├── src/
│   ├── config/         # Database and environment configuration
│   ├── controller/     # Request handlers (logic)
│   ├── middleware/     # Auth, error handling, and role verification
│   ├── models/         # Mongoose schemas (User, Attendance, etc.)
│   ├── routes/         # API route definitions
│   ├── utils/          # Helper functions (Email, etc.)
│   └── app.ts          # App entry point and route registration
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- pnpm (recommended) or npm

### Installation

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    # or
    npm install
    ```

### Running the Server

-   **Development Mode** (with hot reload):
    ```bash
    pnpm dev
    # or
    npm run dev
    ```
-   **Build & Start**:
    ```bash
    pnpm build
    pnpm start
    ```

The server successfully runs on port specified in `.env` (default: 5000).

---

## 🔑 Roles & Permissions

The application has three primary roles:
1.  **Admin**: Full access to manage users, batches, and global settings.
2.  **Mentor**: Manages assigned batches, creates sessions, marks attendance, and grades assignments.
3.  **Student**: Views their own dashboard, attendance, assignments, and submits work.

---

## 📡 API Endpoints

### Authentication (`/api`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | User login (returns JWT) | No |
| `POST` | `/logout` | User logout | Yes |
| `GET` | `/me` | Get current user profile | Yes |
| `PUT` | `/change-password` | Change password | Yes |

### Admin (`/api/admin`) - *Requires Admin Role*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/admin` | Create new Admin |
| `POST` | `/mentors` | Create new Mentor |
| `POST` | `/students` | Create new Student |
| `GET` | `/users` | Get all users |
| `POST` | `/batches` | Create a new Batch |
| `GET` | `/batches` | List all batches |
| `PATCH` | `/mentors/:userId/batches` | Assign batches to a mentor |

### Mentor (`/api/mentor`) - *Requires Mentor Role*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/students` | Get students in my batches |
| `GET` | `/batches` | Get my assigned batches |
| `POST` | `/sessions/mentorship` | Schedule a mentorship session |
| `POST` | `/attendance/mark` | Mark student attendance (Present/Absent/Late) |
| `POST` | `/assignments` | Create a new assignment |
| `GET` | `/assignments/:id/submissions` | View assignment submissions |
| `POST` | `/notifications/absentee-alert` | **NEW**: Manually trigger absentee email warning |

### Student (`/api`) - *Requires Student Role*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/attendance/my` | View my attendance history |
| `POST` | `/sessions/learning` | Log a self-learning session |
| `GET` | `/assignments/my` | View my assignments |
| `POST` | `/assignments/submit` | Submit an assignment |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/student` | Get student dashboard stats (includes absentee warning check) |
| `GET` | `/mentor` | Get mentor dashboard stats |
| `GET` | `/admin` | Get admin dashboard stats |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/absentee-alert` | Trigger absentee warning email (Admin/Mentor) |

---

## 🛠️ Key Features
-   **Automated Absentee Warning**: If a student is marked 'absent' for 3 consecutive sessions, the system automatically sends a warning email to them.
-   **Role-Based Access Control (RBAC)**: Middleware ensures users can only access endpoints authorized for their role.
