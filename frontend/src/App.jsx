import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
import TermsOfServicePage from './pages/TermsOfServicePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import DashboardLayout from './layouts/DashboardLayout'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import FacultyDashboard from './pages/dashboards/FacultyDashboard'
import StudentDashboard from './pages/dashboards/StudentDashboard'
import UsersPage from './pages/UsersPage'
import StudentsPage from './pages/StudentsPage'
import CoursesPage from './pages/CoursesPage'
import EnrollmentsPage from './pages/EnrollmentsPage'
import AttendancePage from './pages/AttendancePage'
import GradesPage from './pages/GradesPage'
import AddUserPage from './pages/AddUserPage'
import AddCoursePage from './pages/AddCoursePage'
import AddStudentPage from './pages/AddStudentPage'
import EnrollmentPage from './pages/EnrollmentPage'
import MarkAttendancePage from './pages/MarkAttendancePage'
import GradePage from './pages/GradePage'
import EditUserPage from './pages/EditUserPage'
import EditCoursePage from './pages/EditCoursePage'
import EditStudentPage from './pages/EditStudentPage'
import EditEnrollmentPage from './pages/EditEnrollmentPage'

function PrivateRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } />

        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />

        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }>
          <Route index element={
            user?.role === 'admin' ? <AdminDashboard /> :
            user?.role === 'faculty' ? <FacultyDashboard /> :
            <StudentDashboard />
          } />

          {/* Admin Only Routes */}
          <Route path="users" element={
            <PrivateRoute allowedRoles={['admin']}>
              <UsersPage />
            </PrivateRoute>
          } />

          {/* Faculty & Admin Routes */}
          <Route path="students" element={
            <PrivateRoute allowedRoles={['admin', 'faculty']}>
              <StudentsPage />
            </PrivateRoute>
          } />

          <Route path="courses" element={
            <PrivateRoute allowedRoles={['admin', 'faculty', 'student']}>
              <CoursesPage />
            </PrivateRoute>
          } />

          <Route path="enrollments" element={
            <PrivateRoute allowedRoles={['admin']}>
              <EnrollmentsPage />
            </PrivateRoute>
          } />

          <Route path="attendance" element={
            <PrivateRoute allowedRoles={['admin', 'faculty']}>
              <AttendancePage />
            </PrivateRoute>
          } />

          <Route path="grades" element={
            <PrivateRoute allowedRoles={['admin', 'faculty', 'student']}>
              <GradesPage />
            </PrivateRoute>
          } />
        </Route>

        {/* Standalone Add/Edit Pages */}
        <Route path="/add-user" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AddUserPage />
          </PrivateRoute>
        } />

        <Route path="/edit-user/:id" element={
          <PrivateRoute allowedRoles={['admin']}>
            <EditUserPage />
          </PrivateRoute>
        } />

        <Route path="/add-course" element={
          <PrivateRoute allowedRoles={['admin', 'faculty']}>
            <AddCoursePage />
          </PrivateRoute>
        } />

        <Route path="/edit-course/:id" element={
          <PrivateRoute allowedRoles={['admin', 'faculty']}>
            <EditCoursePage />
          </PrivateRoute>
        } />

        <Route path="/add-student" element={
          <PrivateRoute allowedRoles={['admin', 'faculty']}>
            <AddStudentPage />
          </PrivateRoute>
        } />

        <Route path="/edit-student/:id" element={
          <PrivateRoute allowedRoles={['admin', 'faculty']}>
            <EditStudentPage />
          </PrivateRoute>
        } />

        <Route path="/enroll-student" element={
          <PrivateRoute allowedRoles={['admin', 'faculty']}>
            <EnrollmentPage />
          </PrivateRoute>
        } />

        <Route path="/edit-enrollment/:id" element={
          <PrivateRoute allowedRoles={['admin', 'faculty']}>
            <EditEnrollmentPage />
          </PrivateRoute>
        } />

        <Route path="/mark-attendance" element={
          <PrivateRoute allowedRoles={['admin', 'faculty']}>
            <MarkAttendancePage />
          </PrivateRoute>
        } />

        <Route path="/assign-grade" element={
          <PrivateRoute allowedRoles={['admin', 'faculty']}>
            <GradePage />
          </PrivateRoute>
        } />

        <Route path="/unauthorized" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">403</h1>
              <p className="text-slate-600">You don't have permission to access this page.</p>
            </div>
          </div>
        } />

        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
              <p className="text-slate-600">Page not found.</p>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
