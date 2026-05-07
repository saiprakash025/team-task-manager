#  Team Task Manager

A full-stack web application for project and task management with **role-based access control**. Admins can create projects, manage team members, and control all tasks. Members can view and update only the tasks assigned to them.

 **Live Demo:** https://skillful-balance-production-3c2c.up.railway.app/login  
 **Repo:** (https://github.com/saiprakash025/team-task-manager)

---

## Features

- **Authentication** — Signup & Login with JWT tokens
- **Role-Based Access Control** — Admin vs Member permissions enforced on both frontend and backend
- **Project Management** — Admins create projects and manage team membership
- **Task Management** — Create, assign, edit, delete tasks with status and priority tracking
- **Dashboard** — View task counts by status and overdue tasks at a glance
- **REST API** — Clean API with proper validations and error handling

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL (hosted on Railway) |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Deployment | Railway (backend + DB), Vercel (frontend) |

---

##  Project Structure
team-task-manager/
├── backend/
│ └── src/
│ ├── server.js
│ ├── routes/
│ │ ├── authRoutes.js
│ │ ├── projectRoutes.js
│ │ ├── taskRoutes.js
│ │ └── dashboardRoutes.js
│ ├── middleware/
│ │ ├── authMiddleware.js
│ │ └── roleMiddleware.js
│ └── db/
│ └── connection.js
└── frontend/
└── src/
├── api/
│ └── axiosInstance.js
├── context/
│ └── AuthContext.jsx
├── components/
│ ├── Navbar.jsx
│ └── PrivateRoute.jsx
└── pages/
├── LoginPage.jsx
├── SignupPage.jsx
├── DashboardPage.jsx
├── ProjectsPage.jsx
└── ProjectDetailPage.jsx


##  Role-Based Access Control

| Action | Admin | Member |
|---|---|---|
| Create project | ✅ | ❌ |
| Add members to project | ✅ | ❌ |
| Create task | ✅ | ❌ |
| Edit task | ✅ | ❌ |
| Delete task | ✅ | ❌ |
| Assign task | ✅ | ❌ |
| View own assigned tasks | ✅ | ✅ |
| Update own task status | ✅ | ✅ |
| View dashboard | ✅ | ✅ |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |

### Projects
| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/api/projects` | List user's projects | Any |
| POST | `/api/projects` | Create project | Admin |
| GET | `/api/projects/:id` | Project details | Member+ |
| POST | `/api/projects/:id/members` | Add member | Admin |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Admin |

### Tasks
| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/api/tasks/project/:projectId` | Get tasks (member gets only own) | Any |
| POST | `/api/tasks/project/:projectId` | Create task | Admin |
| PATCH | `/api/tasks/:id` | Update task | Admin |
| DELETE | `/api/tasks/:id` | Delete task | Admin |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/overview` | Task counts by status + overdue tasks |

---

## Demo Accounts

Use these accounts to test the app:

| Role | Email | Password |
| Admin | `admin@teamtask.local` | `Admin@123` |
| Member 2 | `member2@teamtask.local` | `Member@123` |

##Author

**Sai Prakash Rao Kotla**  
📧 saiprakashraokotla@gmail.com  
🔗 [linkedin.com/in/saiprakash025](https://linkedin.com/in/saiprakash025)  
🐙 [github.com/saiprakash025](https://github.com/saiprakash025)
