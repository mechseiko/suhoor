import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'

export default function BottomPrompt({
    isOpen,
    onClose,
    title,
    description,
    onConfirm,
    onCancel,
    onBack,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    backText = 'Back',
    isLoading = false,
    type = 'default',
    icon: Icon
}) {
    if (!isOpen) return null

    const typeStyles = {
        default: 'bg-primary',
        danger: 'bg-red-600',
        success: 'bg-green-600'
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-end justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-md bg-white rounded-t-3xl overflow-hidden shadow-2xl"
                    >
                        <div className={`${typeStyles[type] || typeStyles.default} p-6 pb-12 text-white relative`}>
                            {/* Decorative blurs */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl"></div>

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        {Icon && (
                                            <div className="p-2 bg-white/20 rounded-xl">
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                        )}
                                        <h3 className="text-xl font-black italic tracking-tight">{title}</h3>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-blue-100 text-sm leading-relaxed max-w-xs font-medium">
                                    {description}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 bg-white -mt-6 rounded-t-3xl relative z-20 space-y-3">
                            <div className="flex gap-3">
                                {onBack && (
                                    <button
                                        onClick={onBack}
                                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors cursor-pointer"
                                    >
                                        {backText}
                                    </button>
                                )}
                                {onCancel && (
                                    <button
                                        onClick={onCancel}
                                        className="flex-1 px-4 py-3 border-2 border-gray-100 text-gray-500 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        {cancelText}
                                    </button>
                                )}
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-[2] px-4 py-3 ${type === 'danger' ? 'bg-red-500' : 'bg-primary'} text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        confirmText
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
