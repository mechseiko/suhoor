export default function ProfileButton(currentUser, navigate) {
    return (
        <button
            onClick={() => navigate('/profile')}
            className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
        >
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                {currentUser?.email?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 pr-2">{currentUser?.email}</span>
        </button>
    )
}