import { Link } from "react-router-dom"
import { useNative } from "../hooks/useNative"

export default function Logo() {
    const isNative = useNative();
    return (
        <div>
            {isNative ?
                <div className="flex items-center space-x-2">
                    <img src="/logo.png" alt="Suhoor Logo" width="32" height="32" className="h-8 w-8 rounded-lg" />
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">Suhoor</span>
                </div>
                :
                <Link to={'/'} className="flex items-center space-x-2">
                    <img src="/logo.png" alt="Suhoor Logo" width="32" height="32" className="h-8 w-8 rounded-lg" />
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">Suhoor</span>
                </Link>
            }
        </div>
    )
}