import { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose?.()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    if (!message) return null

    const styles = {
        success: 'bg-white border-green-100 text-green-800',
        error: 'bg-white border-red-100 text-red-800',
        info: 'bg-white border-blue-100 text-blue-800'
    }

    const icons = {
        success: <div className="w-2 h-2 rounded-full bg-green-500"></div>,
        error: <div className="w-2 h-2 rounded-full bg-red-500"></div>,
        info: <div className="w-2 h-2 rounded-full bg-blue-500"></div>
    }

    return (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${styles[type] || styles.info}`}>
                {icons[type] || icons.info}
                <span className="text-sm font-medium">{message}</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-2 hover:bg-black/5 p-1 rounded-full transition-colors cursor-pointer"
                    >
                        <X size={14} className="opacity-50" />
                    </button>
                )}
            </div>
        </div>
    )
}
