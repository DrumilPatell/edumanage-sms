# EduManage - Student Management System

Modern full-stack student management system with OAuth authentication, role-based access control, and comprehensive academic tracking.

## 🌐 Live Demo

- **Frontend**: [https://edumanage-frontend.vercel.app](https://edumanage-frontend.vercel.app)
- **Backend API**: [https://edumanage-backend-id05.onrender.com](https://edumanage-backend-id05.onrender.com)
- **API Documentation**: [https://edumanage-backend-id05.onrender.com/api/docs](https://edumanage-backend-id05.onrender.com/api/docs)

> ⚠️ **Note**: Backend is hosted on Render free tier and may take 30-60 seconds to wake up on first request.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Installation

**1. Clone & Setup**
```bash
git clone https://github.com/DrumilPatell/edumanage-sms.git
cd edumanage-sms
```

**2. Backend Setup**
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
```

Create `.env` file:
```env
DATABASE_URL=postgresql+pg8000://postgres:password@localhost:5432/edumanage_db
SECRET_KEY=your-secret-key-min-32-characters
FRONTEND_URL=http://localhost:5173

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_REDIRECT_URI=http://localhost:8000/api/auth/microsoft/callback
MICROSOFT_TENANT_ID=your-tenant-id

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:8000/api/auth/github/callback

# Role Assignment
ADMIN_EMAILS=admin@example.com
FACULTY_EMAILS=faculty@example.com
STUDENT_EMAILS=student@example.com
```

Start backend:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**3. Frontend Setup**
```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Start frontend:
```bash
npm run dev
```

Visit `http://localhost:5173`

## 🎯 Features

### Authentication
- OAuth 2.0 (Google, Microsoft, GitHub)
- Email/Password registration
- JWT token sessions
- Auto role assignment based on email configuration

### Role-Based Dashboards
- **Admin**: Full user/student/course/enrollment/fees management
- **Faculty**: Course management, attendance tracking, grading
- **Student**: View courses, grades, attendance, fee records

### Core Functions
- Student profile management
- Course catalog & enrollment
- Attendance tracking with calendar view
- Grade management with GPA calculation
- **Fee Management System**
  - Create fee records per student/course
  - Record payments with payment tracking
  - Delete fee records with confirmation modal
  - View payment history
- Real-time updates
- Semester management

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | FastAPI, Python 3.11, SQLAlchemy 2.0, Pydantic v2 |
| **Database** | PostgreSQL (pg8000 driver) |
| **Frontend** | React 18, Vite, Tailwind CSS, Zustand |
| **Auth** | OAuth 2.0, JWT, Authlib |
| **Deployment** | Vercel (Frontend), Render (Backend & Database) |

## 🚀 Deployment

### Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (DATABASE_URL, SECRET_KEY, OAuth credentials, FRONTEND_URL)
5. Create a **PostgreSQL** database on Render and link it

### Frontend (Vercel)

1. Import project on [Vercel](https://vercel.com)
2. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variable:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://your-backend.onrender.com/api`)

### OAuth Redirect URIs (Production)

Update redirect URIs in OAuth provider consoles:
- **Google**: `https://your-backend.onrender.com/api/auth/google/callback`
- **Microsoft**: `https://your-backend.onrender.com/api/auth/microsoft/callback`
- **GitHub**: `https://your-backend.onrender.com/api/auth/github/callback`

## 📁 Project Structure

```
edumanage-sms/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # API routes
│   │   ├── auth/                # OAuth & authentication
│   │   ├── core/                # Config & security
│   │   ├── db/                  # Database models
│   │   └── schemas/             # Pydantic schemas
│   ├── main.py                  # FastAPI application
│   ├── requirements.txt
│   └── render.yaml              # Render deployment config
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API client
│   │   └── store/               # Zustand state management
│   ├── vercel.json              # Vercel deployment config
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/{provider}/login` | OAuth login |
| GET | `/api/auth/{provider}/callback` | OAuth callback |
| POST | `/api/auth/register` | Email registration |
| POST | `/api/auth/login` | Email login |
| GET | `/api/students` | List students |
| GET | `/api/courses` | List courses |
| GET | `/api/enrollments` | List enrollments |
| GET | `/api/attendance` | List attendance |
| GET | `/api/grades` | List grades |
| GET | `/api/fees/records` | List fee records |
| POST | `/api/fees/records` | Create fee record |
| DELETE | `/api/fees/records/{id}` | Delete fee record |
| POST | `/api/fees/payments` | Record payment |

Full API documentation available at `/api/docs`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 👥 Author

**Drumil Patel** - [GitHub](https://github.com/DrumilPatell)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📈 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced reporting and analytics
- [ ] Bulk operations
- [ ] File upload for documents
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Mobile app
- [ ] Advanced search and filtering
- [ ] Data export (CSV, PDF)
- [ ] Dark mode