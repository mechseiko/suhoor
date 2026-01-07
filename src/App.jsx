import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ProtectedRoute from './components/ProtectedRoute'
import PageLayout from './layouts/PageLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import GroupDetail from './pages/GroupDetail'
import Books from './pages/Books'
import Duas from './pages/Duas'
import Profile from './pages/Profile'
import FastingTimesPage from './pages/FastingTimesPage'
import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import ScrollToTop from './components/ScrollToTop'
import PWAManager from './components/PWAManager'
import About from './pages/About'
import { useAuth } from './context/AuthContext'

// Extract Routes to a component that is inside AuthProvider
function AppRoutes() {
  const { currentUser } = useAuth();
  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/books" element={<Books />} />
        <Route path="/duas" element={<Duas />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/group/:groupId"
        element={
          <ProtectedRoute>
            <GroupDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fasting"
        element={
          <ProtectedRoute>
            <FastingTimesPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={currentUser ? '/dashboard' : '/'} />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <PWAManager />
      <ScrollToTop />
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
