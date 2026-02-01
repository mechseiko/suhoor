import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ProtectedRoute from './components/ProtectedRoute'
import PageLayout from './layouts/PageLayout'
import ScrollToTop from './components/ScrollToTop'
import { useAuth } from './context/AuthContext'
import { useNative } from './hooks/useNative'
import Landing from './pages/Landing'

const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const GroupDetail = lazy(() => import('./pages/GroupDetail'))
const Books = lazy(() => import('./pages/Books'))
const Duas = lazy(() => import('./pages/Duas'))
const Profile = lazy(() => import('./pages/Profile'))
const FastingTimesPage = lazy(() => import('./pages/FastingTimesPage'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const About = lazy(() => import('./pages/About'))
const Groups = lazy(() => import('./pages/Groups'))
const Settings = lazy(() => import('./pages/Settings'))
const Docs = lazy(() => import('./pages/Docs'))


import { useEffect } from 'react'
import { hideSplashScreen } from './main'


function AppRoutes() {
  const { currentUser, loading } = useAuth()
  const isNative = useNative()

  useEffect(() => {
    if (!loading) {
      hideSplashScreen();
    }
  }, [loading]);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/" element={isNative ? <Login /> : <Landing />} />
          <Route path="/docs" element={<Docs />} />
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
          path="/groups"
          element={
            <ProtectedRoute>
              <Groups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId"
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
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
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

        <Route path="/*" element={<Navigate to={currentUser ? '/dashboard' : '/'} />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App;
