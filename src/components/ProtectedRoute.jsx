
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
    const { currentUser, userProfile, loading, profileLoading } = useAuth();

    if (loading || (currentUser && profileLoading)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!currentUser) {
        return <Navigate to="/login" />
    }

    return children;
}
