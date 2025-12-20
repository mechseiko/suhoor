import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Menu, X } from "lucide-react";
import Cta from "./Cta";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProfileButton from "../components/ProfileButton"


export default function Header({ isScrolled, currentNavItem, navBar, navigate }) {

    const { currentUser } = useAuth();

    const NavBar = ({ style }) => {
        return (
            <>
                {navBar.map((navItem, index) => {
                    return (
                        <Link
                            title={navItem.label}
                            target={`${!navItem.to.startsWith('/') ? '_blank' : '_parent'}`}
                            key={index}
                            className={`${style} `}
                            to={navItem.to}
                        >
                            {navItem.label}
                        </Link>
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
                    <div className="space-x-3">
                        <NavBar style={`text-md hover:underline py-0.5 px-2 rounded-sm text-light`} />
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
                                    target={`${!navItem.to.startsWith('/') ? '_blank' : '_parent'}`}
                                    key={index}
                                    className={`text-center p-2 rounded-md mx-10 ${currentNavItem === navItem.to ? 'bg-primary bg-blue-500 text-white' : 'hover:bg-blue-300'}`}
                                    to={navItem.to}
                                >
                                    {navItem.label}
                                </Link>

                            ))}
                            <Cta flex='col' />
                        </div> :
                        <></>
                }
            </header>
        </>
    )
}