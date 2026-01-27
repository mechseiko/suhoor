

export default function Toast() {
    return(
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${toast.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-blue-100 text-blue-800'
                }`}>
                <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <span className="text-sm font-medium">{toast.message}</span>
            </div>
        </div>
    )
}