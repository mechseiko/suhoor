import { useAuth } from '../context/AuthContext'
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
    const {logout} = useAuth()

    const handleLogout = async () => {
            try {
                await logout();
                navigate('/');
            } catch (error) {
                console.error("Logout failed", error);
            }
        }

    return(
        <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
        >
            <LogOut className="h-5 w-5" />
            <span className="inline font-medium">Logout</span>
        </button>
    )
}