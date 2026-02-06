import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
    Download, AlertTriangle, Layout, Users,
    Clock, ArrowRight, Smartphone, Globe,
    Menu, X, Terminal, LayoutDashboard,
    BookOpen,
    Settings2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Docs() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const section = queryParams.get("section");
    const { currentUser } = useAuth()
    const [activeSection, setActiveSection] = useState(section === 'mobile-setup' ? 'mobile-setup' : 'introduction')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownload = () => {
        setIsDownloading(true)
        setTimeout(() => {
            setIsDownloading(false)
        }, 5000)
    }

    const sections = [
        {
            id: 'introduction',
            title: 'Introduction',
            icon: <Terminal size={18} />,
            content: (
                <div className="space-y-6">
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Suhoor is an application designed for fasting muslims, you create an account, download the app and create or join groups of people with a similar goal. To ensure no member of your group misses suhoor. By combining teamwork, location sharing and persistent alarms, Suhoor bridges the gap between individual discipline and collective support.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-1">Our Mission</h4>
                            <p className="text-sm text-blue-700">Connecting hearts and homes through technology to make the spiritual journey of fasting more shared and reliable.</p>
                        </div>
                        <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10">
                            <h4 className="font-bold text-accent mb-1">Accountability</h4>
                            <p className="text-sm text-gray-600">No more unanswered calls. See who is awake and who needs a helping hand to get up.</p>
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
                            { step: 1, title: 'Download App', alert: false },
                            { step: 2, title: 'Install APK', desc: 'Open the downloaded file. If your browser asks for permission, tap "Settings" and enable "Allow from this source".', alert: true },
                            { step: 3, title: 'Permissions', desc: 'When you first open the app, allow Location and Notification permissions for full features.', alert: false },
                        ].map((s) => (
                            <div key={s.step} className="flex gap-4 p-5 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white text-sm rounded-full flex items-center justify-center">{s.step}</div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{s.title}</h4>
                                    <p className="text-sm text-gray-500">{s.desc}</p>
                                    {s.step === 1 && (
                                        <p className="text-sm text-gray-500">If you haven't already, <a
                                            href="https://github.com/mechseiko/suhoor/releases/latest/download/Suhoor.apk"
                                            onClick={handleDownload}
                                            className="mt-2 flex items-center gap-2 text-[11px] font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100"
                                        >
                                            <Download size={12} /> {isDownloading ? 'Downloading...' : 'Download the App'}
                                        </a>
                                        </p>
                                    )}
                                    {s.alert && s.step === 2 && (
                                        <div className="mt-2 w-fit flex items-center gap-2 text-[11px] font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                            <AlertTriangle size={12} /> Enable "Unknown Sources" if prompted.
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
                    <div className="overflow-x-auto border border-gray-100 rounded-2xl">
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
                                    <td className="px-6 py-4 font-bold">Mobile APK</td>
                                    <td className="px-6 py-4"><span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-[10px] font-bold">FULL</span></td>
                                    <td className="px-6 py-4 text-gray-500 italic">Background Alarms, Live Tracking, Notifications ...</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-bold">Mobile Web</td>
                                    <td className="px-6 py-4"><span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-[10px] font-bold">PARTIAL</span></td>
                                    <td className="px-6 py-4 text-gray-500 italic">Dashboard access, Manual checkins (Must keep tab open)</td>
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
            title: 'Dashboard',
            icon: <LayoutDashboard size={18} />,
            subsections: [
                { id: 'dash-overview', title: 'Dashboard Overview', icon: <Layout size={14} />, desc: 'Here, you see your past and current stats, an email verification banner and pending prompts, which asks you if you want to fast the next day. The top banner will guide you on your next steps if you are a new user.' },
                { id: 'groups', title: 'Group Management', icon: <Users size={14} />, desc: 'From this page you can join or create groups using unique keys. Within a group, you can monitor the status of members, see live locations during wake up windows, and manually "Buzz" members who are still sleeping.' },
                { id: 'fasting', title: 'Fasting Times & Prompts', icon: <Clock size={14} />, desc: "A prompt appears every evening asking if you wish to fast the next day. If you agree, Suhoor, as well as your group members will be able to wake you, the location you give will be released to your group members during your wake-up window and you can be buzzed if you have'nt already woken up. If you choose no, your team members will be aware of this from your group's page. The prompt defaults to no on normal days but defaults to yes in three cases \n\n 1. Mondays and Thurdays \n\n 2. The 13th, 14th & 15th of every islamic month \n\n 3. All days of ramadan. You can also edit all these in the settings page" },
                { id: 'resources', title: 'Resources', icon: <BookOpen size={14} />, desc: "This is where you have unlimited access to the available books of knowledge on fasting and more from different scholars, It's built to make your fasting period more productive and blessed." },
                { id: 'settings', title: 'Profile & Settings', icon: <Settings2 size={14} />, desc: 'Here you can set your preferences, or make some chages to your suhoor account.' }
            ],
            content: (
                <div className="space-y-12">
                    <p className="text-gray-600">The Suhoor dashboard serves as your command center for both spiritual reflection and group coordination.</p>
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

    useEffect(() => {
        if (section === 'mobile-setup') {
            scrollTo('mobile-setup')
        }
    }, [section])


    return (
        <div className={`relative min-h-screen  pt-8 md:pt-20 text-gray-900 mb-10`}>
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <div className={`flex max-w-[1400px] mx-auto md:p-6`}>
                <aside className={`
                        fixed lg:sticky overflow-y-auto top-0 lg:top-20 left-0 h-full lg:h-fit w-72 bg-white lg:bg-transparent z-40 p-6 lg:p-2 border-r lg:border-r-0 border-gray-100 transition-transform duration-300
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                    <div className="space-y-8">
                        <div className='md:mt-5 mt-15'>
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">In this page</h3>
                            <nav className="space-y-2">
                                {sections.map(s => (
                                    <div key={s.id} className="space-y-2">
                                        <button
                                            onClick={() => scrollTo(s.id)}
                                            className={`w-full flex items-center cursor-pointer gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeSection === s.id ? 'bg-blue-50 text-primary shadow-sm border border-primary' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
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
                                                        className={`w-full cursor-pointer flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeSection === sub.id ? 'text-primary' : 'text-gray-400 hover:text-gray-700'
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

                        {currentUser && (
                            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                <h4 className="text-xs font-bold text-primary mb-2">Ready to get started?</h4>
                                <p className="text-[11px] text-gray-600 mb-3">Join thousands of muslims already using Suhoor.</p>
                                <button
                                    onClick={() => window.location.href = '/signup'}
                                    className="w-full py-2 cursor-pointer bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                                >
                                    Sign Up For Free
                                </button>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-12 max-w-4xl pr-4">
                    <header className="mb-12 md:mt-5 mt-15">
                        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-4">Documentation</h1>
                        <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
                            Welcome to the official Suhoor documentation. Everything you need to set up, navigate, and master the group wake up experience.
                        </p>
                    </header>

                    <div className="space-y-24 pb-32">
                        {sections.map(section => (
                            <section key={section.id} id={section.id} className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-2 mb-8">
                                    <div className={`${activeSection === section.id ? 'bg-primary text-white' : 'text-primary bg-gray-50'} p-1 rounded-sm border border-gray-100`}>
                                        {section.icon && (Object.cloneElement ? Object.cloneElement(section.icon, { size: 20 }) : section.icon)}
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900">{section.title}</h2>
                                </div>

                                {section.content}

                                {section.subsections && (
                                    <div className="mt-12 space-y-6">
                                        {section.subsections.map(sub => (
                                            <div key={sub.id} id={sub.id} className="scroll-mt-32 p-8 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
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

                    <footer className="mt-10 p-8 bg-gray-900 rounded-lg text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
                            <p className="text-gray-400 text-sm">Reach out to support.</p>
                        </div>
                        <button onClick={() => window.location.href = 'mailto:suhoorapp@gmail.com'} className="bg-white cursor-pointer text-gray-900 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2">
                            Get Support <ArrowRight size={18} />
                        </button>
                    </footer>
                </main>
            </div>
        </div>
    )
}
