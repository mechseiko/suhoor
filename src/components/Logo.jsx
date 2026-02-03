import { Link } from "react-router-dom"
import { useNative } from "../hooks/useNative"
import { useState } from "react";

export default function Logo() {
    const isNative = useNative();
    const [animation, setAnimation] = useState('')
    return (
        <div onMouseEnter={() => setAnimation('rotate-logo')} onMouseLeave={() => setAnimation('')}>
            {isNative ?
                <div className="flex items-center space-x-2">
                    <img className={`${animation} h-8 w-8 rounded-lg`}  src="/logo.png" alt="Suhoor Logo" />
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">Suhoor</span>
                </div>
                :
                <Link to={'/'} className="flex items-center space-x-2">
                    <img className={`${animation} h-8 w-8 rounded-lg`}  src="/logo.png" alt="Suhoor Logo" />
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">Suhoor</span>
                </Link>
            }
        </div>
    )
}