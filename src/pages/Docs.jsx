import { useState, useEffect } from 'react'
import {
    Download, AlertTriangle, Check, Shield, Layout, Users,
    Clock, Bell, Info, ArrowRight, Smartphone, Globe,
    Menu, X, ChevronRight, BarChart3, Star, Ghost
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PageLayout from '../layouts/PageLayout'
import DashboardLayout from '../layouts/DashboardLayout'

export default function Docs() {
    const { currentUser } = useAuth()
    const [activeSection, setActiveSection] = useState('introduction')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Use DashboardLayout if logged in, otherwise PageLayout
    const LayoutWrapper = currentUser ? DashboardLayout : PageLayout

    const sections = [
        {
            id: 'introduction',
            title: 'Introduction',
            icon: <Info size={18} />,
            content: (
                <div className="space-y-6">
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Suhoor is a community-driven application designed to ensure no member of your group misses their pre-dawn meal during fasting seasons. By combining real-time synchronization, location sharing, and persistent alarms, Suhoor bridges the gap between individual discipline and collective support.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-1">Our Mission</h4>
                            <p className="text-sm text-blue-700">Connecting hearts and homes through technology to make the spiritual journey of fasting more shared and reliable.</p>
                        </div>
                        <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10">
                            <h4 className="font-bold text-accent mb-1">Peer Accountability</h4>
                            <p className="text-sm text-gray-600">No more unanswered calls. See exactly who is awake and who needs a helping hand to get up.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'mobile-setup',
            title: 'Mobile App Setup',
            icon: <Smartphone size={18} />,
            content: (
                <div className="space-y-6">
                    <p className="text-gray-600">The best experience is on Android. Follow these steps to install the native app:</p>
                    <div className="space-y-4">
                        {[
                            { step: 1, title: 'Download APK', desc: 'Visit the landing page and click "Download App" to get the latest APK file.', alert: false },
                            { step: 2, title: 'Enable Unknown Sources', desc: 'Go to Settings > Security and enable "Install from Unknown Sources" for your browser.', alert: true },
                            { step: 3, title: 'Install APK', desc: 'Open the downloaded file and click "Install". If Play Protect warns you, tap "Install Anyway".', alert: false },
                            { step: 4, title: 'Permissions', desc: 'When you first open the app, allow Location and Notification permissions for full features.', alert: false }
                        ].map((s) => (
                            <div key={s.step} className="flex gap-4 p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">{s.step}</div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{s.title}</h4>
                                    <p className="text-sm text-gray-500">{s.desc}</p>
                                    {s.alert && (
                                        <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                            <AlertTriangle size={12} /> Mandatory for Android beta versions.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'compatibility',
            title: 'Compatibility',
            icon: <Globe size={18} />,
            content: (
                <div className="space-y-6">
                    <div className="overflow-hidden border border-gray-100 rounded-2xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Platform</th>
                                    <th className="px-6 py-4">Support</th>
                                    <th className="px-6 py-4">Features</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr>
                                    <td className="px-6 py-4 font-bold">Android APK</td>
                                    <td className="px-6 py-4"><span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-[10px] font-bold">FULL</span></td>
                                    <td className="px-6 py-4 text-gray-500 italic">Background Alarms, Live Tracking, Notifications</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-bold">Mobile Web</td>
                                    <td className="px-6 py-4"><span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-[10px] font-bold">PARTIAL</span></td>
                                    <td className="px-6 py-4 text-gray-500 italic">Dashboard access, Manual check-ins (Must keep tab open)</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-bold">Desktop</td>
                                    <td className="px-6 py-4"><span className="text-gray-400 bg-gray-50 px-2 py-1 rounded-full text-[10px] font-bold">BASIC</span></td>
                                    <td className="px-6 py-4 text-gray-500 italic">Analytics, Group Management, Profile edits</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        },
        {
            id: 'dashboard',
            title: 'Navigating the Dashboard',
            icon: <Layout size={18} />,
            subsections: [
                { id: 'dash-overview', title: 'Dashboard Overview', icon: <Smartphone size={14} />, desc: 'The heart of your Suhoor experience. See today\'s status, pending prompts, and a daily spiritual quote to start your day with intention. The top banner will guide you on your next steps if you are a new user.' },
                { id: 'dash-groups', title: 'Group Management', icon: <Users size={14} />, desc: 'Join or create groups using unique keys. Within a group, you can monitor member status in real-time, see live locations during wake-up windows (15 minutes before Suhoor), and manually "Buzz" friends who are still sleeping to ensure they don\'t miss the meal.' },
                { id: 'dash-fasting', title: 'Fasting Status & Prompts', icon: <Bell size={14} />, desc: 'A dedicated prompt appears every evening asking "Suhoor for Tomorrow?". Your response determines if you\'ll be tracked and buzzed. You can also view upcoming prayer and fasting times based on your precise location, with automatic caching for offline use.' },
                { id: 'dash-analytics', title: 'Personal Analytics', icon: <BarChart3 size={14} />, desc: 'Visualize your consistency over the year. Our interactive charts track your fasting history and monthly participation trends, helping you stay motivated and see your progress at a glance.' },
                { id: 'dash-milestones', title: 'Milestones & Achievements', icon: <Star size={14} />, desc: 'Consistency is rewarded. Earn badges like "7-Day Streak" or "Ramadan Spirit" by checking in daily. These milestones are displayed on your dashboard and profile as badges of honor for your dedication.' }
            ],
            content: (
                <div className="space-y-12">
                    <p className="text-gray-600">The Suhoor dashboard is optimized for clarity and high-stakes mornings. It serves as your command center for both spiritual reflection and group coordination.</p>
                </div>
            )
        }
    ]

    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = sections.flatMap(s => [s, ...(s.subsections || [])])
            for (const section of sectionElements) {
                const element = document.getElementById(section.id)
                if (element) {
                    const rect = element.getBoundingClientRect()
                    if (rect.top >= 0 && rect.top <= 200) {
                        setActiveSection(section.id)
                        break
                    }
                }
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollTo = (id) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
            setIsSidebarOpen(false)
        }
    }

    return (
        <LayoutWrapper>
            <div className={`relative min-h-screen ${currentUser ? 'bg-transparent' : 'bg-white pt-20'}`}>
                {/* Mobile Sidebar Toggle */}
                <div className="lg:hidden fixed bottom-6 right-6 z-50">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <div className={`flex max-w-[1400px] mx-auto ${currentUser ? 'p-4 md:p-6' : 'px-6 lg:px-12'}`}>
                    {/* Sidebar / Navigation */}
                    <aside className={`
                        fixed lg:sticky top-0 lg:top-24 left-0 h-full lg:h-fit w-72 bg-white lg:bg-transparent z-40 p-8 lg:p-0 border-r lg:border-r-0 border-gray-100 transition-transform duration-300
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Documentation</h3>
                                <nav className="space-y-1">
                                    {sections.map(s => (
                                        <div key={s.id} className="space-y-1">
                                            <button
                                                onClick={() => scrollTo(s.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSection === s.id ? 'bg-blue-50 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {s.icon}
                                                {s.title}
                                            </button>
                                            {s.subsections && (
                                                <div className="ml-9 border-l border-gray-100 space-y-1">
                                                    {s.subsections.map(sub => (
                                                        <button
                                                            key={sub.id}
                                                            onClick={() => scrollTo(sub.id)}
                                                            className={`w-full flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeSection === sub.id ? 'text-primary' : 'text-gray-400 hover:text-gray-700'
                                                                }`}
                                                        >
                                                            {sub.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </nav>
                            </div>

                            {!currentUser && (
                                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                                    <h4 className="text-xs font-bold text-primary mb-2">Want the app?</h4>
                                    <p className="text-[11px] text-gray-600 mb-3">Join thousands staying connected for Suhoor.</p>
                                    <button
                                        onClick={() => window.location.href = '/signup'}
                                        className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                                    >
                                        Sign Up Free
                                    </button>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 lg:ml-12 max-w-4xl">
                        <header className="mb-12">
                            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4">User Guide</h1>
                            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
                                Welcome to the official Suhoor documentation. Everything you need to set up, navigate, and master the community wake-up experience.
                            </p>
                        </header>

                        <div className="space-y-24 pb-32">
                            {sections.map(section => (
                                <section key={section.id} id={section.id} className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-gray-50 rounded-2xl text-primary border border-gray-100">
                                            {section.icon && (Object.cloneElement ? Object.cloneElement(section.icon, { size: 24 }) : section.icon)}
                                        </div>
                                        <h2 className="text-3xl font-black text-gray-900">{section.title}</h2>
                                    </div>

                                    {section.content}

                                    {section.subsections && (
                                        <div className="mt-12 space-y-12">
                                            {section.subsections.map(sub => (
                                                <div key={sub.id} id={sub.id} className="scroll-mt-32 p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="p-2 bg-blue-50 text-primary rounded-xl">
                                                            {sub.icon}
                                                        </div>
                                                        <h3 className="text-xl font-bold text-gray-900">{sub.title}</h3>
                                                    </div>
                                                    <p className="text-gray-600 leading-relaxed italic border-l-4 border-blue-100 pl-4 py-2 bg-blue-50/30 rounded-r-xl">
                                                        {sub.desc}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>

                        <footer className="mt-12 p-8 bg-gray-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
                                <p className="text-gray-400 text-sm">Join our community Discord or reach out to support.</p>
                            </div>
                            <button className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2">
                                Get Support <ArrowRight size={18} />
                            </button>
                        </footer>
                    </main>
                </div>
            </div>
        </LayoutWrapper>
    )
}
