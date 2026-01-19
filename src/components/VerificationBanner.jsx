import { AlertCircle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function VerificationBanner() {
    const navigate = useNavigate()

    return (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-3">
            <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p className="font-medium">
                        Your account is not verified. Please verify your account to access all features.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-1.5 text-amber-700 hover:text-amber-800 font-medium whitespace-nowrap cursor-pointer group transition-colors"
                >
                    <span>Verify Account</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
            </div>
        </div>
    )
}
