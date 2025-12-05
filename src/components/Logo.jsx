import { Moon } from "lucide-react"
import { Link } from "react-router-dom"

export default function () {
    return (

        <Link to="/" className="flex items-center space-x-2">
            <Moon className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Suhoor</span>
        </Link>
    )
}