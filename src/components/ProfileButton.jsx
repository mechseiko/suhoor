

export default function ProfileButton({ currentUser, navigate }) {
    const displayName = currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'User';
    const initial = displayName?.charAt(0).toUpperCase() || '?';

    return (
        <button
            title={`Logged in as ${currentUser?.email ? currentUser?.email : (currentUser?.uid || 'Guest')}`}
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 hover:bg-gray-100 transition-colors"
        >
            <div className="md:h-6 md:w-6 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {initial}
            </div>
            <span className="text-sm font-medium text-gray-700 pr-1">{displayName.slice(0, 15)}</span>
        </button>
    )
}