import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProfileButton from "../components/ProfileButton"
import Container from "./Container";
import Toast from "./Toast";


export default function Header({ isScrolled, currentNavItem, navBar, navigate }) {

    const { currentUser, logout } = useAuth();
    const [toast, setToast] = useState(null)

    const NavBar = ({ style }) => {
        return (
            <>
                {navBar.map((navItem, index) => {
                    const isActive = currentNavItem === navItem.to || (navItem.to === '/' && currentNavItem === '/');
                    return (
                        <div key={index} className="relative group">
                            <Link
                                className={`${style} ${isActive ? 'text-primary' : 'text-gray-600'} transition-colors duration-300`}
                                to={navItem.to}
                            >
                                {navItem.label}
                            </Link>
                            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full ${isActive ? 'hidden' : ''}`}></span>
                        </div>
                    );
                })}
            </>
        )
    }


    const Cta = () => {
        return (
            <div className="flex space-x-5 *:cursor-pointer justify-center items-center">
                <button
                    onClick={() => { setIsMenuOpen(false); navigate('/login') }}
                    className="w-fit sm:w-auto px-5 py-1.5 bg-primary text-white text-base rounded-lg hover:opacity-90 font-medium transition shadow-lg hover:shadow-xl"
                >
                    Login
                </button>
                <button
                    onClick={() => { setIsMenuOpen(false); navigate('/signup') }}
                    className="w-fit sm:w-auto px-5 py-1.5 bg-white border-2 border-primary text-primary text-base rounded-lg hover:bg-primary/10 font-medium transition"
                >
                    Sign Up
                </button>
            </div>
        )
    }

    const handleLogout = async () => {
        try {
            setToast({ message: 'Logged out successfully', type: 'success' })
            setTimeout(async () => {
                await logout()
                navigate('/')
            }, 1500)
        } catch (err) {
            console.error('Logout failed:', err)
            setToast({ message: 'Failed to logout', type: 'error' })
        }
    }

    const UserCta = () => {
        return (
            <div className="flex md:flex-row flex-col items-center gap-4">
                <div className="scale-110">
                    <ProfileButton currentUser={currentUser} />
                </div>
                <button
                    onClick={handleLogout}
                    className="text-red-500 cursor-pointer font-medium py-2 px-3 hover:bg-red-50 rounded-lg w-full text-center"
                >
                    Logout
                </button>
            </div>
        )
    }
    const [isMenuOpen, setIsMenuOpen] = useState(false);


    return (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMenuOpen === true ? 'bg-white/80 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'}`}>
            <Container>
                <header className="lg:flex hidden">
                    <div className="container mx-auto flex items-center justify-between xl:px-15">
                        <Logo />
                        <div className="flex gap-8">
                            <NavBar style={`text-base font-medium py-1`} />
                        </div>
                        {
                            !currentUser ? <Cta /> :
                                <UserCta />
                        }
                    </div>
                </header>

                <header className="lg:hidden">
                    <div className="flex justify-between items-center px-3">
                        <Logo />
                        <div onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X /> : <Menu />}</div>
                    </div>
                    {
                        isMenuOpen ?
                            <div className="animate-navBar space-y-3 mb-2 mt-5 flex flex-col items-center">
                                {navBar.map((navItem, index) => {
                                    const isActive = currentNavItem === navItem.to || (navItem.to === '/' && currentNavItem === '/');

                                    return (
                                        <Link
                                            key={index}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`text-center p-2 rounded-md mx-10 ${isActive ? 'bg-primary w-[150px] text-white' : 'hover:bg-blue-300'}`}
                                            to={navItem.to}
                                        >
                                            {navItem.label}
                                        </Link>
                                    )
                                })}
                                <div className="mt-4">
                                    <hr className="mb-6" />
                                    {currentUser ? (
                                        <UserCta />
                                    ) : (
                                        <Cta />
                                    )}
                                </div>
                            </div> :
                            <></>
                    }
                </header>
            </Container>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    )
}