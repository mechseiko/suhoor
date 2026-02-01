
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
    const { currentUser, userProfile, loading, profileLoading } = useAuth();

    if (loading || (currentUser && profileLoading)) {
        return null;
    }

    if (!currentUser) {
        return <Navigate to="/login" />
    }

    // Check if email is verified
    if (userProfile && !userProfile.isVerified) {
        return <Navigate to="/verify-email" />
    }

    return children;
}
