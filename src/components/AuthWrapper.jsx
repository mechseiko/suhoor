import { Link } from 'react-router-dom'

export default function AuthWrapper({ children, title, subtitle, error, bottomTitle, bottomsubTitle }) {

    const nativePlatform = Capacitor.isNativePlatform();
    const isPWA = window.matchMedia('display-mode: standalone').matches || window.navigator.standalone === true;
    const isNative = nativePlatform || isPWA;

    const Logo = () => {
        return (
            <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="Suhoor Logo" className="h-12 w-12 rounded-lg" />
                <span className="text-4xl font-bold text-gray-900">Suhoor</span>
            </div>
        )
    }
    return (
        <div className={`${isNative ? 'sm:pt-30 md:pb-15' : 'md:pt-30 pt-25 md:pb-15 pb-12'} flex items-center justify-center`}>
            <div className="max-w-md w-full">
                {isNative &&
                    <div
                        className={`sm:hidden mt-[30%] flex justify-center items-center`}
                    >
                        <Logo />
                    </div>
                }
                <div className={`${isNative ? 'md:rounded-b-2xl w-full rounded-t-2xl sm:relative fixed bottom-0 left-0 right-0' : 'rounded-2xl'} max-w-xl bg-white p-8 shadow-xl`}>
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
                        <Link to={`/${bottomsubTitle?.toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^\w-]+/g, '')}`} className="text-blue-600 hover:text-blue-700">
                            {bottomsubTitle}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}