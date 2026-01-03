import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Container from '../components/Container'


export const navBar = [
    { label: 'Home', to: '/' },
    { label: 'Books', to: '/books' },
    { label: 'Duas', to: '/duas' },
]


export default function PageLayout({ children }) {
    const navigate = useNavigate()
    const location = useLocation()
    const currentNavItem = `/${location.pathname.split('/')[1]}`
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
            {/* <Container> */}
                <Header
                    isScrolled={isScrolled}
                    currentNavItem={currentNavItem}
                    navBar={navBar}
                    navigate={navigate}
                />
                <main className="container mx-auto px-1 flex-grow">
                    {children ? children : <Outlet />}
                </main>
            {/* </Container> */}
            <Footer 
                currentNavItem={currentNavItem}
            />

        </div>
    )
}
