import LanderCta from "./LanderCta";
import { useAuth } from "../context/AuthContext";


export default function CtaSection() {
    const { currentUser } = useAuth();
    return (
        <div className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {currentUser ? 'Jump right Back In!' : 'Ready to Get Started?'}
                        </h2>
                        <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                            {currentUser?.displayName ? `${currentUser.displayName}, Pick up right where you left off` : 'Join Muslims already using Suhoor'}
                        </p>
                        <LanderCta
                            className1="group md:px-6 px-4 py-2 bg-white text-primary rounded-lg font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                            className2="md:px-6 px-4 py-2 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
