import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';

export default function ProtectedRoute({ children }) {
  const { currentUser, userProfile, loading, profileLoading } = useAuth();
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile && !userProfile.isVerified) {
      setToast({ message: 'Please verify your email to continue', type: 'info' });

      const t = setTimeout(() => {
        navigate('/verify-email', { replace: true });
      }, 1000);

      return () => clearTimeout(t);
    }
  }, [userProfile, navigate]);

  if (loading || (currentUser && profileLoading)) {
    return null;
  }

  if (!currentUser) {
    navigate('/login', { replace: true });
    return null;
  }

  if (userProfile && !userProfile.isVerified) {
    return (
      <>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    );
  }

  return children;
}