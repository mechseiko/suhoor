import { Link } from "react-router-dom"

export default function Logo() {
    return (
        <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Suhoor Logo" className="h-8 w-8 rounded-lg" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Suhoor</span>
        </Link>
    )
}