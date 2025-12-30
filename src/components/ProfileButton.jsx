export default function ProfileButton({ currentUser, navigate }) {
    const displayName = currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0];
    const initial = displayName?.charAt(0).toUpperCase();

    return (
        <button
            onClick={() => navigate('/profile')}
            className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
        >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {initial}
            </div>
            <span className="text-sm font-medium text-gray-700 pr-2">{displayName}</span>
        </button>
    )
}