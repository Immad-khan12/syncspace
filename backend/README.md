<div align="center">

# ⚡ SyncSpace

### Real-Time Collaborative Document Editor

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

**A production-grade, real-time collaborative document editor built with modern web technologies.**

[Live Demo](https://syncspace-ivory.vercel.app/) · [Backend API](https://syncspace-backend-wk47.onrender.com/api/health)

</div>

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login with access + refresh token rotation
- 📝 **Rich Text Editor** — TipTap powered with 15+ formatting options
- ⚡ **Real-Time Collaboration** — Socket.io rooms with live presence
- 👥 **Live Cursors** — See collaborators' cursors with names and colors
- 💾 **Auto-Save** — Debounced autosave to MongoDB every 2 seconds
- 🎨 **Premium Dark UI** — Glassmorphism, Framer Motion animations
- ⌘ **Command Palette** — Ctrl+K quick navigation like Linear/VSCode
- 🔒 **Role-Based Access** — Admin, Editor, Viewer permissions
- 📱 **Responsive Design** — Works on all screen sizes
- 🚀 **Production Deployed** — Vercel + Render + MongoDB Atlas

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations and transitions |
| TipTap | Rich text editor |
| Zustand | Global state management |
| Socket.io Client | Real-time communication |
| React Router v6 | Client-side routing |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database and ODM |
| Socket.io | WebSocket server |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| Yjs | CRDT collaboration engine |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/syncspace.git
cd syncspace

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

Create `/backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=http://localhost:5173
```

### Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open `http://localhost:5173`

---

## 📁 Project Structure

syncspace/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, validation
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── sockets/         # Socket.io handlers
│   └── server.js        # Entry point
│
└── frontend/
└── src/
├── api/         # Axios instance
├── components/  # Reusable UI components
├── hooks/       # Custom React hooks
├── pages/       # Route pages
├── routes/      # Router config
├── sockets/     # Socket client
├── store/       # Zustand stores
└── lib/         # Utilities

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| POST | `/api/auth/refresh` | Refresh token |
| GET  | `/api/auth/me` | Get current user |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| GET    | `/api/documents` | Get all documents |
| POST   | `/api/documents` | Create document |
| GET    | `/api/documents/:id` | Get single document |
| PATCH  | `/api/documents/:id` | Update document |
| DELETE | `/api/documents/:id` | Delete document |

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://syncspace-ivory.vercel.app/ |
| Backend | Render | https://syncspace-backend-wk47.onrender.com |
| Database | MongoDB Atlas | Cloud hosted |

---

## 👨‍💻 Author

**Muhammad Immad** — Built as a portfolio project demonstrating production-grade full-stack engineering.

[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat-square&logo=github)](https://github.com/YOUR_USERNAME)

---

<div align="center">
  <p>Built with ❤️ using React, Node.js, and Socket.io</p>
</div>