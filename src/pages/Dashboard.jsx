import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Plus, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import GroupList from '../components/GroupList'
import CreateGroupModal from '../components/CreateGroupModal'
import JoinGroupModal from '../components/JoinGroupModal'
import FastingTimes from '../components/FastingTimes'
import Logo from '../components/Logo'
import Loader from '../components/Loader'

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

    console.log("!currentUser:", !currentUser)

    useEffect(() => {
        if (currentUser) {
            createOrUpdateProfile()
            fetchGroups()
            // logout()
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
            // Query group_members where user_id == currentUser.uid
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
            // Fetch actual group data
            // Note: Firestore 'in' query supports up to 10 items. For more, we'd need to batch or fetch individually.
            // For simplicity, we'll fetch individually here or use 'in' if we assume < 10 groups.
            // Let's fetch individually to be safe for now, or use a loop.
            const groupsData = []
            for (const groupId of groupIds) {
                const groupRef = doc(db, 'groups', groupId)
                const groupSnap = await getDoc(groupRef)
                if (groupSnap.exists()) {
                    groupsData.push({ id: groupSnap.id, ...groupSnap.data() })
                }
            }
            setGroups(groupsData)
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

    if (linkGroupKey !== '') { setShowJoinModal(true); }

    return (
        <div className="min-h-screen">
            <nav className="bg-white shadow-sm">
                <div className="container mx-auto py-3">
                    <div className="flex items-center justify-between">
                        <Logo />
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">{currentUser?.email}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">Your Groups</h2>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowJoinModal(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                                >
                                    <Users className="h-5 w-5" />
                                    <span>Join Group</span>
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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

                    <div className="lg:col-span-1">
                        <FastingTimes />
                    </div>
                </div>
            </main>

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

