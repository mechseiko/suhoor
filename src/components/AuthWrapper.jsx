import Logo from "./Logo"
import {Link} from 'react-router-dom'


export default function AuthWrapper({ children, title, subtitle, error, bottomTitle, bottomsubTitle }) {
    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <div className="flex mb-3 flex-col justify-center items-center ">
                    <Logo />
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

                <p className="text-center text-gray-600 mt-6">
                    {bottomTitle} {' '}
                    <Link to={`/${bottomsubTitle.toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w-]+/g, '')}`} className="text-blue-600 hover:text-blue-700">
                        {bottomsubTitle}
                    </Link>
                </p>

            </div>
            
            </div>
    )
}