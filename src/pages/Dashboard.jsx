import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Plus, Users, TrendingUp, Award, Menu, X, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { doc, getDoc, setDoc, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore'
import GroupList from '../components/GroupList'
import CreateGroupModal from '../components/CreateGroupModal'
import JoinGroupModal from '../components/JoinGroupModal'
import FastingTimes from '../components/FastingTimes'
import Logo from '../components/Logo'
import Loader from '../components/Loader'
import StatsCard from '../components/StatsCard'
import DailyQuote from '../components/DailyQuote'
import ProfileButton from '../components/ProfileButton'
import HydrationTracker from '../components/HydrationTracker'
import ProTip from '../components/ProTip'

export default function Dashboard() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const linkGroupKey = queryParams.get("groupKey");
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showJoinModal, setShowJoinModal] = useState(false)
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ totalGroups: 0, totalMembers: 0, activeToday: 0 })
    const [showSidebar, setShowSidebar] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)

    useEffect(() => {
        if (currentUser) {
            createOrUpdateProfile()
            fetchGroups()
        }
    }, [currentUser])

    const GroupAction = ({ className }) => {
        return (
            <div className={className}>
                <button
                    onClick={() => setShowJoinModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-blue-300 hover:text-primary transition-all duration-200 font-medium"
                >
                    <Users className="h-5 w-5" />
                    <span>Join Group</span>
                </button>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 font-medium"
                >
                    <Plus className="h-5 w-5" />
                    <span>Create Group</span>
                </button>
            </div>
        )
    }

    const createOrUpdateProfile = async () => {
        try {
            const userRef = doc(db, 'profiles', currentUser.uid)
            const userSnap = await getDoc(userRef)

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    email: currentUser.email,
                    display_name: currentUser.email.split('@')[0],
                    created_at: new Date().toISOString()
                })
            }
        } catch (err) {
            console.error('Error with profile:', err)
        }
    }

    const fetchGroups = async () => {
        try {
            const membersRef = collection(db, 'group_members')
            const q = query(membersRef, where('user_id', '==', currentUser.uid))
            const querySnapshot = await getDocs(q)

            const groupIds = []
            querySnapshot.forEach((doc) => {
                groupIds.push(doc.data().group_id)
            })

            // if (groupIds.length === 0) {
            //     setGroups([])
            //     setLoading(false)
            //     return
            // }

            const groupsData = []
            for (const groupId of groupIds) {
                const groupRef = doc(db, 'groups', groupId)
                const groupSnap = await getDoc(groupRef)
                if (groupSnap.exists()) {
                    // Fetch member count
                    const membersRef = collection(db, 'group_members')
                    const memberCountQuery = query(membersRef, where('group_id', '==', groupId))
                    const memberCountSnap = await getCountFromServer(memberCountQuery)

                    groupsData.push({
                        id: groupSnap.id,
                        ...groupSnap.data(),
                        member_count: memberCountSnap.data().count
                    })
                }
            }
            setGroups(groupsData)

            const totalMembers = groupsData.reduce((sum, group) => sum + (group.member_count || 0), 0)
            setStats({
                totalGroups: groupsData.length,
                totalMembers: totalMembers,
                activeToday: groupsData.filter(g => g.last_activity === new Date().toISOString().split('T')[0]).length
            })
        } catch (err) {
            console.error('Error fetching groups:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/')
        } catch (err) {
            console.error('Logout failed:', err)
        }
    }

    useEffect(() => {
        if (linkGroupKey) {
            setShowJoinModal(true);
        }
    }, [linkGroupKey]);

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Mobile Sidebar Overlay */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Top Navigation */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                {showMobileMenu ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
                            </button>
                            <Logo />
                        </div>

                        <div className="flex md:gap-2 items-center">
                            <ProfileButton currentUser={currentUser} navigate={navigate} />
                            <button
                                onClick={handleLogout}
                                className="hidden sm:flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="inline font-medium">Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {showMobileMenu && (
                        <div className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4 animate-in slide-in-from-top-2">
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setShowJoinModal(true)
                                        setShowMobileMenu(false)
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-blue-200 text-primary rounded-xl hover:bg-blue-50 transition-colors font-medium"
                                >
                                    <Users className="h-5 w-5" />
                                    <span>Join Group</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(true)
                                        setShowMobileMenu(false)
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition-colors font-medium shadow-lg shadow-blue-200"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span>Create Group</span>
                                </button>
                                <button
                                    onClick={() => setShowSidebar(!showSidebar)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-primary/90 text-white rounded-xl hover:opacity-90 transition-colors font-medium shadow-lg shadow-blue-200">
                                    <Clock className="h-5 w-5" />
                                    <span>Fasting Times</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Welcome & Quote Section */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
                            <div className="xl:col-span-2 flex flex-col justify-center">
                                <h1 className="text-gray-900 text-[20px] mb-2">
                                    Welcome back, <span className='text-xl md:text-2xl font-bold'>{(currentUser?.displayName || currentUser?.email?.split('@')[0])?.split(' ')[0]}</span> 👋
                                </h1>
                                <p className="text-lg text-gray-500 mb-4">
                                    May your fasts be accepted and your prayers answered. Here's your daily summary.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
                                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} <br />
                                    </div>
                                </div>
                            </div>
                            <div className="xl:col-span-1">
                                <DailyQuote />
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                            <StatsCard
                                icon={Users}
                                title="Total Groups"
                                value={stats.totalGroups}
                                subtitle="Groups you're part of"
                                color="blue"
                            />
                            <StatsCard
                                icon={TrendingUp}
                                title="Total Members"
                                value={stats.totalMembers}
                                subtitle="Across all groups"
                                color="green"
                            />
                            <StatsCard
                                icon={Award}
                                title="Active Today"
                                value={stats.activeToday}
                                subtitle="Groups with activity"
                                color="purple"
                            />
                        </div>

                        {/* Groups Section */}
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Your Groups</h2>
                                    <p className="text-sm text-gray-500 mt-1">Manage and monitor your group activities</p>
                                </div>
                                {groups.length > 0 && <GroupAction className="hidden lg:flex gap-3" />}
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader />
                                </div>
                            ) : groups.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Users className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        No groups yet
                                    </h3>
                                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                        Create a new group to invite friends or join an existing one to get started with your journey.
                                    </p>
                                    <GroupAction className="flex justify-center gap-4" />
                                </div>
                            ) : (
                                <GroupList groups={groups} onUpdate={fetchGroups} />
                            )}
                        </div>
                    </main>

                    {/* Desktop Sidebar - Fasting Times */}
                    <aside className="hidden lg:block w-80 xl:w-96 shrink-0">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-primary" />
                                        Fasting Times
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <FastingTimes />
                                </div>
                            </div>
                            <ProTip />
                            <HydrationTracker />
                        </div>
                    </aside>
                </div>
            </div>

            {/* Mobile Sidebar - Fasting Times */}
            <aside className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 lg:hidden ${showSidebar ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Fasting Times
                    </h3>
                    <button
                        onClick={() => setShowSidebar(false)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
                    <FastingTimes />
                    <ProTip />
                    <HydrationTracker />
                </div>
            </aside>

            {showCreateModal && (
                <CreateGroupModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false)
                        fetchGroups()
                    }}
                />
            )}

            {showJoinModal && (
                <JoinGroupModal
                    onClose={() => setShowJoinModal(false)}
                    onSuccess={() => {
                        setShowJoinModal(false)
                        fetchGroups()
                    }}
                    linkGroupKey={linkGroupKey}
                />
            )}
        </div>
    )
}
