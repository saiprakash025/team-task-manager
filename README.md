# 🗂️ Team Task Manager

A full-stack web application for managing projects and tasks with **role-based access control (Admin / Member)**. Admins control all project and task operations. Members can only view and update tasks assigned to them.

🔗 **Live Demo:** https://skillful-balance-production-3c2c.up.railway.app/login
📁 **Repo:** [github.com/saiprakash025/team-task-manager](https://github.com/saiprakash025/team-task-manager)

---

## 🚀 Features

- 🔐 **Authentication** — Signup & Login with JWT tokens and bcrypt password hashing
- 👥 **Role-Based Access Control** — Admin vs Member permissions enforced on API and UI
- 📁 **Project Management** — Admins create projects and add/remove team members
- ✅ **Task Management** — Create, assign, edit, delete tasks with status and priority
- 📊 **Dashboard** — Task counts by status + overdue tasks for logged-in user
- 🌐 **REST API** — Fully validated endpoints with centralized error handling

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router DOM, Axios |
| Backend | Node.js, Express.js v5 |
| Database | MongoDB |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Deployment | Railway (backend + Frontend) |

---

## 📁 Project Structure

```
team-task-manager/
│
├── backend/
│   └── src/
│       ├── server.js                  # Entry point — starts Express server
│       ├── app.js                     # Express app setup, middleware, routes
│       ├── config/
│       │   └── db.js                  
│       ├── models/
│       │   ├── User.js                # User queries
│       │   ├── Project.js             # Project queries
│       │   ├── ProjectMember.js       # Project membership queries
│       │   └── Task.js                # Task queries
│       ├── middlewares/
│       │   ├── authMiddleware.js      # JWT verification
│       │   └── roleMiddleware.js      # Admin / Member role check
│       └── routes/
│           ├── authRoutes.js          # POST /api/auth/signup, /login
│           ├── projectRoutes.js       # CRUD projects + member management
│           ├── taskRoutes.js          # CRUD tasks (admin only for write ops)
│           └── dashboardRoutes.js     # GET /api/dashboard/overview
│
└── frontend/
    └── src/
        ├── main.jsx                   # React entry point
        ├── App.jsx                    # Router + route definitions
        ├── App.css
        ├── index.css
        ├── api/
        │   └── axiosInstance.js       # Axios base URL + JWT interceptor
        ├── context/
        │   └── AuthContext.jsx        # Global auth state (user, login, logout)
        ├── components/
        │   ├── Navbar.jsx             # Top nav with role-aware links
        │   ├── PrivateRoute.jsx       # Redirects unauthenticated users
        │   └── TaskCard.jsx           # Reusable task card component
        └── pages/
            ├── LoginPage.jsx
            ├── SignupPage.jsx
            ├── DashboardPage.jsx      # Task stats + overdue list
            ├── ProjectsPage.jsx       # Project list (admin can create)
            └── ProjectDetailPage.jsx  # Tasks + members per project
```

---

## ⚙️ Local Setup

### Prerequisites

- Node.js v18+
- MySQL running locally or on Railway
- Git

### 1. Clone the repo

```bash
git clone https://github.com/saiprakash025/team-task-manager.git
cd team-task-manager
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=teamtaskdb
JWT_SECRET=your_jwt_secret_here
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔐 Role-Based Access Control

| Action | Admin | Member |
|---|---|---|
| Create project | ✅ | ❌ |
| Add / remove members | ✅ | ❌ |
| Create task | ✅ | ❌ |
| Edit task | ✅ | ❌ |
| Delete task | ✅ | ❌ |
| Assign task to user | ✅ | ❌ |
| View own assigned tasks | ✅ | ✅ |
| Update own task status | ✅ | ✅ |
| View dashboard | ✅ | ✅ |

---

## 🌐 API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Projects

| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/api/projects` | Get user's projects | Any |
| POST | `/api/projects` | Create a project | Admin |
| GET | `/api/projects/:id` | Project details + members | Member+ |
| POST | `/api/projects/:id/members` | Add member to project | Admin |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Admin |

### Tasks

| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/api/tasks/project/:projectId` | Get tasks (members see only their own) | Any |
| POST | `/api/tasks/project/:projectId` | Create task | Admin |
| PATCH | `/api/tasks/:id` | Update task | Admin |
| DELETE | `/api/tasks/:id` | Delete task | Admin |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/overview` | Task counts by status + overdue tasks for logged-in user |

---

## 🧪 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@teamtask.local` | `Admin@123` |
| Member 1 | `member1@teamtask.local` | `Member@123` |
| Member 2 | `member2@teamtask.local` | `Member@123` |

**Demo project:** `Alpha Launch` with 5 tasks across statuses, priorities, and 1 overdue task visible on the Admin dashboard.

---

## 🚢 Deployment

### Backend → Railway

1. Push code to GitHub
2. Create a new Railway project → add **MySQL** database service
3. Create a **Node.js** service linked to your GitHub repo
4. Set root directory to `backend`
5. Add environment variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`
6. Railway auto-assigns `PORT` — ensure `server.js` uses `process.env.PORT`

### Frontend → Vercel

1. Import repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL` = your Railway backend URL
4. Deploy — Vercel handles the Vite build automatically

---

## 👨‍💻 Author

**Sai Prakash Rao Kotla**
📧 saiprakashraokotla@gmail.com
🔗 [linkedin.com/in/saiprakash025](https://linkedin.com/in/saiprakash025)
🐙 [github.com/saiprakash025](https://github.com/saiprakash025)
