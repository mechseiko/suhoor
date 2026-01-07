import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
    Users,
    Plus,
    Clock,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    UserCircle,
    BookOpen,
    Hand
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import ProfileButton from '../components/ProfileButton'
import LogoutButton from '../components/LogoutButton'

export default function DashboardLayout({
    children,
    setShowJoinModal,
    setShowCreateModal,
    rightSidebar,
    pageTitle
}) {
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showMobileMenu, setShowMobileMenu] = useState(false)

    // Determine page title based on route if not provided
    const getPageTitle = () => {
        if (pageTitle) return pageTitle
        const path = location.pathname
        if (path === '/dashboard') return 'Dashboard'
        if (path === '/fasting') return 'Fasting'
        if (path === '/profile') return 'Profile'
        if (path === '/books') return ''
        if (path === '/duas') return ''
        if (path.startsWith('/group/')) return 'Group Details'
        return 'Dashboard'
    }

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/')
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
            icon: Clock,
            label: 'Fasting',
            onClick: () => navigate('/fasting'),
            active: location.pathname === '/fasting'
        },
        {
            icon: UserCircle,
            label: 'Profile',
            onClick: () => navigate('/profile'),
            active: location.pathname === '/profile'
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
    ]

    const actionItems = [
        {
            icon: Users,
            label: 'Join Group',
            onClick: () => {
                navigate('/dashboard?from=join')
                setShowJoinModal?.(true)
                setShowMobileMenu(false)
            }
        },
        {
            icon: Plus,
            label: 'Create Group',
            onClick: () => {
                navigate('/dashboard?from=create')
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

            <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-1">Actions</p>
                {actionItems.map((item, idx) => (
                    <SidebarLink key={idx} {...item} />
                ))}
            </div>

            <div className="md:hidden pt-4 border-t border-gray-100">
                <SidebarLink
                    icon={LogOut}
                    label="Logout"
                    onClick={handleLogout}
                    variant="danger"
                />
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-white">
            {/* Top Navigation - Mobile Only */}
            <nav className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {showMobileMenu ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
                        </button>
                        <Logo />
                    </div>
                    <ProfileButton currentUser={currentUser} navigate={navigate} />
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
                        <div className="sticky md:flex items-center justify-between top-[61px] lg:top-0 z-30 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200/50 px-4 md:px-8 py-3">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
                            <div className='hidden md:flex items-center gap-4'>
                                <ProfileButton currentUser={currentUser} />
                                <LogoutButton />
                            </div>
                        </div>
                    }

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8">
                        <div className="flex flex-col xl:flex-row gap-8">
                            {/* Main Scrollable Area */}
                            <div className="flex-1">
                                {children ? children : <Outlet />}
                            </div>

                            {/* Right Sidebar - Optional & Narrower */}
                            {rightSidebar && (
                                <aside className="w-full xl:w-72 shrink-0">
                                    <div className="sticky top-8 space-y-6">
                                        {rightSidebar}
                                    </div>
                                </aside>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
