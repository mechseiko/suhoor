import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useNative } from '../hooks/useNative'

export const navBar = [
    { label: 'Home', to: '/' },
    { label: 'Books', to: '/books' },
    { label: 'Duas', to: '/duas' },
    { label: 'About', to: '/about' },
]
import { useAuth } from '../context/AuthContext'
export default function PageLayout({ children }) {

    const isNative = useNative();

    const { currentUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const currentNavItem = `/${location.pathname.split('/')[1]}`
    const [isScrolled, setIsScrolled] = useState(false)

    const dynamicNavBar = [
        { label: 'Home', to: '/' },
        ...(currentUser ? [{ label: 'Dashboard', to: '/dashboard' }] : []),
        { label: 'Books', to: '/books' },
        { label: 'Duas', to: '/duas' },
        { label: 'About', to: '/about' },
    ]

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const publicPaths = ['/', '/about', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email']

    if ((currentUser && !publicPaths.includes(location.pathname)
        ||
        (isNative))) {
        return <div className="min-h-screen flex flex-col">{children ? children : <Outlet />}</div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
            <Header
                isScrolled={isScrolled}
                currentNavItem={currentNavItem}
                navBar={dynamicNavBar}
                navigate={navigate}
            />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow w-full">
                {children ? children : <Outlet />}
            </main>
            <Footer
                currentNavItem={currentNavItem}
            />
        </div>
    )
}
