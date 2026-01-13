import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { doc, getDoc, setDoc, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore'
import GroupList from '../components/GroupList'
import CreateGroupModal from '../components/CreateGroupModal'
import JoinGroupModal from '../components/JoinGroupModal'
import DashboardLayout from '../layouts/DashboardLayout'

export default function Groups() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const linkGroupKey = queryParams.get("groupKey");
    const from = queryParams.get("from");
    const { currentUser } = useAuth();
    const [showJoinModal, setShowJoinModal] = useState(from === 'join' ? true : false);
    const [showCreateModal, setShowCreateModal] = useState(from === 'create' ? true : false);

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
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 hover:shadow-md hover:shadow-blue-200 transition-all duration-200 font-medium text-sm"
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
            navigate('/groups')
            setShowJoinModal(false)
        }
        else {
            setShowJoinModal(false)
        }
    }
    const CloseCreateModal = () => {
        if (from === 'create') {
            navigate('/groups')
            setShowCreateModal(false)
        }
        else {
            setShowCreateModal(false)
        }
    }

    const GroupResponse = ({title, subtitle}) => {
        return(
            <div>
                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                    {subtitle}
                </p>
            </div>
        )
    }

    return (
        <DashboardLayout
            setShowJoinModal={setShowJoinModal}
            setShowCreateModal={setShowCreateModal}
            rightSidebar={rightSidebar}
        >
            {/* Groups Section */}
            <div className="space-y-6" id="groups-section">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
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


                {loading && groups.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
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
                        <GroupResponse title="No groups yet" subtitle="Create a new group to invite friends or join an existing one to get started."/> 
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
                                <GroupResponse title='No groups found' subtitle={`You are not a member of any groups matching "${searchQuery}"`}/>

                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="px-6 py-2 cursor-pointer bg-primary text-white rounded-xl hover:opacity-90 transition font-medium"
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
            {/* Modals */}
            {showCreateModal && (
                <CreateGroupModal
                    onClose={CloseCreateModal}
                    onSuccess={() => {
                        setShowCreateModal(false)
                        fetchGroups()
                    }}
                />
            )}

            {showJoinModal && (
                <JoinGroupModal
                    onClose={CloseJoinModal}
                    onSuccess={() => {
                        setShowJoinModal(false)
                        fetchGroups()
                    }}
                    linkGroupKey={linkGroupKey}
                />
            )}
        </DashboardLayout>
    )
}