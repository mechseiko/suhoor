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
import Loader from '../components/Loader'
import StatsCard from '../components/StatsCard'
import DailyQuote from '../components/DailyQuote'
import HydrationTracker from '../components/HydrationTracker'
import ProTip from '../components/ProTip'
import MissedFastsTracker from '../components/MissedFastsTracker'
import DashboardLayout from '../layouts/DashboardLayout'

export default function Dashboard() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const linkGroupKey = queryParams.get("groupKey");
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showJoinModal, setShowJoinModal] = useState(false)
    const [groups, setGroups] = useState(() => {
        const cached = localStorage.getItem(`suhoor_groups_${currentUser?.uid}`)
        return cached ? JSON.parse(cached) : []
    })
    const [loading, setLoading] = useState(!groups.length)
    const [stats, setStats] = useState(() => {
        const cached = localStorage.getItem(`suhoor_stats_${currentUser?.uid}`)
        return cached ? JSON.parse(cached) : { totalGroups: 0, totalMembers: 0, activeToday: 0 }
    })
    const [searchQuery, setSearchQuery] = useState('')

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
            localStorage.setItem(`suhoor_groups_${currentUser.uid}`, JSON.stringify(groupsData))

            const totalMembers = groupsData.reduce((sum, group) => sum + (group.member_count || 0), 0)
            const newStats = {
                totalGroups: groupsData.length,
                totalMembers: totalMembers,
                activeToday: groupsData.filter(g => g.last_activity === new Date().toISOString().split('T')[0]).length
            }
            setStats(newStats)
            localStorage.setItem(`suhoor_stats_${currentUser.uid}`, JSON.stringify(newStats))
        } catch (err) {
            console.error('Error fetching groups:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (linkGroupKey) {
            setShowJoinModal(true);
        }
    }, [linkGroupKey]);

    if (loading && !groups.length) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    const rightSidebar = (
        <>
            <div id="fasting-times">
                <FastingTimes />
            </div>
            <ProTip />
            <HydrationTracker />
            <MissedFastsTracker />
        </>
    )

    return (
        <DashboardLayout
            setShowJoinModal={setShowJoinModal}
            setShowCreateModal={setShowCreateModal}
            rightSidebar={rightSidebar}
        >
            {/* Welcome & Quote Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
                <div className="xl:col-span-2 flex flex-col justify-center">
                    <h1 className="text-gray-900 text-[20px] mb-2 font-medium">
                        Welcome back, <span className='text-xl md:text-2xl font-bold'>{(currentUser?.displayName || currentUser?.email?.split('@')[0])?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-base text-gray-500 mb-4">
                        May your fasts be accepted and your prayers answered.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
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
                    subtitle="Groups joined"
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
                    subtitle="Recent activity"
                    color="purple"
                />
            </div>

            {/* Groups Section */}
            <div className="space-y-6" id="groups-section">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Your Groups</h2>
                        <p className="text-sm text-gray-500">Manage and monitor your circular activities</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Users className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search groups..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                        {groups.length > 0 && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Create</span>
                            </button>
                        )}
                    </div>
                </div>

                {groups.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No groups yet</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Create a new group to invite friends or join an existing one to get started.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="px-6 py-2 border border-gray-200 rounded-xl font-medium"
                            >
                                Join Group
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-2 bg-primary text-white rounded-xl font-medium"
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                ) : (
                    <GroupList
                        groups={groups.filter(group =>
                            group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            group.group_key.toLowerCase().includes(searchQuery.toLowerCase())
                        )}
                        onUpdate={fetchGroups}
                    />
                )}
            </div>

        </DashboardLayout>
    )
}
