import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
    Users,
    Plus,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    UserCircle,
    BookOpen,
    Hand,
    Search,
    Moon,
    ArrowLeft,
    Settings as SettingsIcon
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import ProfileButton from '../components/ProfileButton'
import VerificationBanner from '../components/VerificationBanner'
import SearchModal from '../components/SearchModal'

export default function DashboardLayout({
    children,
    setShowJoinModal,
    setShowCreateModal,
    pageTitle
}) {
    const { currentUser, logout, userProfile } = useAuth()
    const isVerified = userProfile?.isVerified || false;

    const navigate = useNavigate()
    const location = useLocation()
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [showSearchModal, setShowSearchModal] = useState(false)

    useEffect(() => {
        const handleCtrlK = (event) => {
            if (event.ctrlKey && event.key === 'k') {
                event.preventDefault();
                setShowSearchModal(true);
            }
        };
        document.addEventListener('keydown', handleCtrlK);
        return () => document.removeEventListener('keydown', handleCtrlK);
    }, []);

    const getPageTitle = () => {
        if (pageTitle) return pageTitle
        const path = location.pathname
        if (path === '/dashboard') return 'Dashboard'
        if (path === '/fasting') return 'Fasting Times'
        if (path === '/profile') return 'Profile'
        if (path === '/groups') return 'Groups'
        if (path === '/books') return 'Resources'
        if (path === '/duas') return 'Duas'
        if (path.startsWith('/groups/')) return 'Group Details'
        return 'Dashboard'
    }

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (err) {
            console.error('Logout failed:', err)
        }
    }

    const navigationItems = [
        {
            icon: LayoutDashboard,
            label: 'Dashboard',
            onClick: () => navigate('/dashboard'),
            active: location.pathname === '/dashboard'
        },
        {
            icon: Users,
            label: 'Groups',
            onClick: () => navigate('/groups'),
            active: location.pathname === '/groups' || location.pathname.startsWith('/groups/')
        },
        {
            icon: Moon,
            label: 'Fasting Times',
            onClick: () => navigate('/fasting'),
            active: location.pathname === '/fasting'
        },
        {
            icon: BookOpen,
            label: 'Resources',
            onClick: () => navigate('/books'),
            active: location.pathname === '/books'
        },
        {
            icon: Hand,
            label: 'Duas',
            onClick: () => navigate('/duas'),
            active: location.pathname === '/duas'
        },
        {
            icon: UserCircle,
            label: 'Profile',
            onClick: () => navigate('/profile'),
            active: location.pathname === '/profile'
        },
        {
            icon: SettingsIcon,
            label: 'Settings',
            onClick: () => navigate('/settings'),
            active: location.pathname === '/settings'
        },
    ]

    const actionItems = [
        {
            icon: Users,
            label: 'Join Group',
            onClick: () => {
                navigate('/groups?from=join')
                setShowJoinModal?.(true)
                setShowMobileMenu(false)
            }
        },
        {
            icon: Plus,
            label: 'Create Group',
            onClick: () => {
                navigate('/groups?from=create')
                setShowCreateModal?.(true)
                setShowMobileMenu(false)
            },
        },
    ]

    const SidebarLink = ({ icon: Icon, label, onClick, active, variant = "default" }) => (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 cursor-pointer w-full px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${active
                ? "bg-primary/10 text-primary"
                : variant === "danger"
                    ? "text-red-500 hover:bg-red-50"
                    : variant === "primary"
                        ? "bg-primary text-white shadow-md shadow-blue-200 hover:opacity-90"
                        : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                }`}
        >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </button>
    )

    const renderNavContent = () => (
        <div className="space-y-6">
            <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-1">Main Menu</p>
                {navigationItems.map((item, idx) => (
                    <SidebarLink key={idx} {...item} />
                ))}
            </div>

            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-1">Actions</p>
                {actionItems.map((item, idx) => (
                    <SidebarLink key={idx} {...item} />
                ))}
                <div className="md:pt-0 pt-5 border-t border-gray-100">
                    <SidebarLink
                        icon={LogOut}
                        label="Logout"
                        onClick={handleLogout}
                        variant="danger"
                    />
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-white">
            {/* Top Navigation - Mobile Only */}
            <nav className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="px-4 py-3 flex items-center justify-between">
                    <Logo />
                    <div className="flex items-center gap-1">
                        <div className='cursor-pointer text-primary' title="Search" onClick={() => setShowSearchModal(true)}>
                            <Search size="18" />
                        </div>
                        <ProfileButton currentUser={currentUser} navigate={() => { }} />
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:p-2 md:hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {showMobileMenu ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
                        </button>
                    </div>

                </div>

                {/* Mobile Menu Overlay */}
                {showMobileMenu && (
                    <div className="fixed inset-0 top-[61px] bg-white z-50 p-4 animate-in slide-in-from-top-2">
                        {renderNavContent()}
                    </div>
                )}
            </nav>

            <div className="max-w-[1600px] mx-auto flex h-full min-h-screen">
                {/* Desktop Left Sidebar - Fixed & Narrower */}
                <aside className="hidden lg:flex flex-col w-56 border-r border-gray-100 shrink-0 sticky top-0 h-screen overflow-y-auto no-scrollbar bg-white p-5">
                    <div className="mb-6">
                        <Logo />
                    </div>

                    <div className="flex-1">
                        {renderNavContent()}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 bg-gray-50/30 flex flex-col">
                    {/* Page Header - Sticky */}
                    {getPageTitle() !== '' &&
                        <div className="sticky top-[58px] lg:top-0 z-30 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200/50">
                            <div className='md:flex items-center justify-between px-4 md:px-8 py-3'>
                                <div className='flex gap-2 items-center'>
                                    <ArrowLeft className={`${!['/dashboard'].includes(location.pathname) ? '' : 'hidden'} cursor-pointer pl-2 size-6 text-gray-500`} title="Back" onClick={() => navigate(-1)} />
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
                                </div>
                                <div className='hidden lg:flex items-center gap-3'>
                                    <div className='cursor-pointer flex items-center bg-gray-50 hover:bg-gray-100 rounded-full px-2 py-1 text-primary' title="Search" onClick={() => setShowSearchModal(true)}>
                                        <Search size="18" />
                                        <p className="text-xs font-semibold text-gray-400 tracking-widest px-2">Ctrl + K</p>
                                    </div>
                                    <ProfileButton currentUser={currentUser} />
                                </div>
                            </div>
                            {!isVerified && location.pathname === '/dashboard' && (
                                <VerificationBanner />
                            )}
                        </div>
                    }

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:px-6 py-3 pb-10">
                        <div className="max-w-6xl mx-auto w-full">
                            {children ? children : <Outlet />}
                        </div>
                    </div>
                </main>
            </div>
            {showSearchModal && (
                <SearchModal
                    onClose={() => setShowSearchModal(false)}
                />
            )}
        </div>
    )
}
