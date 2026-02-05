import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext";
import { ArrowRight } from "lucide-react";


export default function LanderCta({className1, className2}) {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    return(
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 *:cursor-pointer">
            <button
                onClick={() => navigate(currentUser ? '/dashboard' : '/signup')}
                className={className1}
            >
                {currentUser ? 'Go to Dashboard' : 'Get Started'}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
                onClick={() => navigate(currentUser ? '/books' : '/docs')}
                className={className2}
            >
                {currentUser ? 'Explore Resources' : 'Read Documentation'}
            </button>
        </div>
    )
}

