import { Moon } from "lucide-react"
import { Link } from "react-router-dom"

export default function () {
    return (

        <Link to="/" className="flex items-center space-x-1">
            <Moon className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold text-gray-900">Suhoor</span>
        </Link>
    )
}