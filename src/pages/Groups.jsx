import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Users, TrendingUp, Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { doc, getDoc, setDoc, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore'
import GroupList from '../components/GroupList'
import Loader from '../components/Loader'
import StatsCard from '../components/StatsCard'
import DailyQuote from '../components/DailyQuote'
import DashboardLayout from '../layouts/DashboardLayout'

export default function groupsData() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const linkGroupKey = queryParams.get("groupKey");
    const from = queryParams.get("from");
    const { currentUser } = useAuth();

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

    const Modals = () => {
        return (
            <div className="flex gap-3 justify-center *:cursor-pointer">
                <button
                    onClick={() => setShowJoinModal(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-primary hover:text-primary transition-all duration-200 font-medium text-sm"
                >
                    <Users className="h-4 w-4" />
                    <span>Join Group</span>
                </button>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 font-medium text-sm"
                >
                    <Plus className="h-4 w-4" />
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



    const rightSidebar = null

    const CloseJoinModal = () => {
        if (from === 'join') {
            navigate('/dashboard')
            setShowJoinModal(false)
        }
        else {
            setShowJoinModal(false)
        }
    }
    const CloseCreateModal = () => {
        if (from === 'create') {
            navigate('/dashboard')
            setShowCreateModal(false)
        }
        else {
            setShowCreateModal(false)
        }
    }

    return (
        <DashboardLayout
            // setShowJoinModal={setShowJoinModal}
            // setShowCreateModal={setShowCreateModal}
            rightSidebar={rightSidebar}
        >
            {/* Groups Section */}
            <div className="space-y-6" id="groups-section">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Your Groups</h2>
                        <p className="text-sm text-gray-500">Manage and monitor your group activities</p>
                    </div>


                    {/* Search and Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {groups.length > 0 && <>
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Users className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search groups..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                                />
                            </div>
                            <Modals />
                        </>
                        }
                    </div>
                </div>


                {loading && groups.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between">
                                <div className="space-y-3 w-full">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                                        <div className="space-y-2 flex-1">
                                            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : groups.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-300 px-6 py-8 text-center">
                        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No groups yet</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Create a new group to invite friends or join an existing one to get started.
                        </p>
                        <Modals />
                    </div>
                ) : (
                    <>
                        {groups.filter(group =>
                            group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            group.group_key.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length > 0 ? (
                            <GroupList
                                groups={groups.filter(group =>
                                    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    group.group_key.toLowerCase().includes(searchQuery.toLowerCase())
                                )}
                                onUpdate={fetchGroups}
                            />
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Users className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No groups found</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                    You are not a member of any groups matching "{searchQuery}"
                                </p>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="px-6 py-2 bg-primary text-white rounded-xl hover:opacity-90 transition font-medium"
                                >
                                    Clear Search
                                </button>
                            </div>
                        )}

                        {searchQuery && groups.filter(group =>
                            group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            group.group_key.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length === 0 && (
                                <div className="mt-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">All Groups</h2>
                                    <GroupList
                                        groups={groups}
                                        onUpdate={fetchGroups}
                                    />
                                </div>
                            )}
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}