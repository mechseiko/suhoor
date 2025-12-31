import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Menu, X } from "lucide-react";
import Cta from "./Cta";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProfileButton from "../components/ProfileButton"


export default function Header({ isScrolled, currentNavItem, navBar, navigate }) {

    const { currentUser, logout } = useAuth();

    const NavBar = ({ style }) => {
        return (
            <>
                {navBar.map((navItem, index) => {
                    const isActive = currentNavItem === navItem.to || (navItem.to === '/' && currentNavItem === '/');
                    return (
                        <div key={index} className="relative group">
                            <Link
                                title={navItem.label}
                                target={!navItem.to.startsWith('/') ? '_blank' : undefined}
                                className={`${style} ${isActive ? 'text-primary' : 'text-gray-600'} transition-colors duration-300`}
                                to={navItem.to}
                            >
                                {navItem.label}
                            </Link>
                            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full ${isActive ? 'w-full' : ''}`}></span>
                        </div>
                    );
                })}
            </>
        )
    }
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const commonStyle = `fixed top-0 left-0 px-1 right-0 z-50 transition-all duration-300 ${isScrolled || isMenuOpen === true ? 'bg-white/80 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'}`

    return (
        <>
            <header className={`${commonStyle} md:flex hidden`}>
                <div className="container mx-auto flex items-center justify-between">
                    <Logo />
                    <div className="flex gap-8">
                        <NavBar style={`text-base font-medium py-1`} />
                    </div>
                    {
                        !currentUser ? <Cta /> :

                            <ProfileButton currentUser={currentUser} navigate={navigate} />
                    }
                </div>
            </header>

            <header className={`${commonStyle} md:hidden`}>
                <div className="flex justify-between items-center px-3">
                    <Logo />
                    <div onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X /> : <Menu />}</div>
                </div>
                {
                    isMenuOpen ?
                        <div className="animate-navBar space-y-3 mb-2 mt-5 flex flex-col">
                            {navBar.map((navItem, index) => (
                                <Link
                                    title={navItem.label}
                                    target={!navItem.to.startsWith('/') ? '_blank' : undefined}
                                    key={index}
                                    className={`text-center p-2 rounded-md mx-10 ${currentNavItem === navItem.to ? 'bg-primary bg-blue-500 text-white' : 'hover:bg-blue-300'}`}
                                    to={navItem.to}
                                >
                                    {navItem.label}
                                </Link>

                            ))}
                            {currentUser ? (
                                <div className="flex flex-col items-center gap-4 mt-2">
                                    <div className="scale-110">
                                        <ProfileButton currentUser={currentUser} navigate={navigate} />
                                    </div>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await logout();
                                                navigate('/');
                                            } catch (error) {
                                                console.error("Logout failed", error);
                                            }
                                        }}
                                        className="text-red-500 font-medium py-2 px-4 hover:bg-red-50 rounded-lg w-full text-center"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Cta flex='col' />
                            )}
                        </div> :
                        <></>
                }
            </header>
        </>
    )
}