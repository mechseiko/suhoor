import { Moon } from "lucide-react"


export default function AuthWrapper({ children, title, subtitle, error }) {
    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <div className="flex gap-2 items-center justify-center mb-5">
                    <Moon className="h-12 w-12 text-primary" />
                    <h1 className='text-3xl font-bold'>Suhoor</h1>
                </div>
                <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">
                    {title}
                </h2>
                <p className="text-center text-gray-600 mb-8">
                    {subtitle}
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}
                {children}
            </div></div>
    )
}