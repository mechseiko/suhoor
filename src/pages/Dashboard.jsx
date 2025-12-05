import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Plus, Users, TrendingUp, Award, Menu, X, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import GroupList from '../components/GroupList'
import CreateGroupModal from '../components/CreateGroupModal'
import JoinGroupModal from '../components/JoinGroupModal'
import FastingTimes from '../components/FastingTimes'
import Logo from '../components/Logo'
import Loader from '../components/Loader'
import StatsCard from '../components/StatsCard'

console.info("imported from firebase/firestore", db, collection, getDoc, setDoc, query, where, getDocs)

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

    console.log("!currentUser:", !currentUser)

    useEffect(() => {
        if (currentUser) {
            createOrUpdateProfile()
            fetchGroups()
        }
    }, [currentUser])

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

            if (groupIds.length === 0) {
                setGroups([])
                setLoading(false)
                return
            }

            const groupsData = []
            for (const groupId of groupIds) {
                const groupRef = doc(db, 'groups', groupId)
                const groupSnap = await getDoc(groupRef)
                if (groupSnap.exists()) {
                    groupsData.push({ id: groupSnap.id, ...groupSnap.data() })
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
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Top Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto py-3 px-3 md:px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                            >
                                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                            <Logo />
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <button
                                onClick={() => setShowSidebar(!showSidebar)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                                title="Fasting Times"
                            >
                                <Clock className="h-5 w-5 text-blue-600" />
                            </button>
                            <span className="text-gray-600 text-sm md:text-base hidden sm:inline">{currentUser?.email}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-3 md:px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {showMobileMenu && (
                        <div className="lg:hidden mt-4 pb-4 border-t pt-4">
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setShowJoinModal(true)
                                        setShowMobileMenu(false)
                                    }}
                                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                                >
                                    <Users className="h-5 w-5" />
                                    <span>Join Group</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(true)
                                        setShowMobileMenu(false)
                                    }}
                                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span>Create Group</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <div className="flex">
                {/* Main Content */}
                <main className="flex-1 container mx-auto px-3 md:px-4 py-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
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
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Your Groups</h2>
                            <div className="hidden lg:flex gap-3">
                                <button
                                    onClick={() => setShowJoinModal(true)}
                                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                                >
                                    <Users className="h-5 w-5" />
                                    <span>Join Group</span>
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span>Create Group</span>
                                </button>
                            </div>
                        </div>

                        {loading ?
                            <Loader />
                            : groups.length === 0 ?
                                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        No groups yet
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Create a new group or join an existing one to get started
                                    </p>
                                </div>
                                : (
                                    <GroupList groups={groups} onUpdate={fetchGroups} />
                                )}
                    </div>
                </main>

                {/* Desktop Sidebar - Fasting Times */}
                <aside className="hidden lg:block w-80 xl:w-96 p-4">
                    <FastingTimes />
                </aside>

                {/* Mobile Sidebar - Fasting Times */}
                <aside className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 lg:hidden ${showSidebar ? 'translate-x-0' : 'translate-x-full'
                    }`}>
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-bold text-lg">Fasting Times</h3>
                        <button
                            onClick={() => setShowSidebar(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
                        <FastingTimes />
                    </div>
                </aside>
            </div>

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
                    linkGroupKey={linkGroupKey && linkGroupKey}
                />
            )}
        </div>
    )
}
