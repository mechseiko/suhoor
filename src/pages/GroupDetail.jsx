import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft,
    Users,
    UserPlus,
    Copy,
    Check,
    Moon,
    LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import WakeUpTracker from '../components/WakeUpTracker'
import InviteMemberModal from '../components/InviteMemberModal'

export default function GroupDetail() {
    const { groupId } = useParams()
    const navigate = useNavigate()
    const { currentUser, logout } = useAuth()
    const [group, setGroup] = useState(null)
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [showInviteModal, setShowInviteModal] = useState(false)

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const groupRef = doc(db, 'groups', groupId)
                const groupSnap = await getDoc(groupRef)

                if (groupSnap.exists()) {
                    setGroup({ id: groupSnap.id, ...groupSnap.data() })
                }
            } catch (err) {
                console.error('Error fetching group:', err)
            } finally {
                setLoading(false)
            }
        }

        const fetchMembers = async () => {
            try {
                const membersRef = collection(db, 'group_members')
                const q = query(membersRef, where('group_id', '==', groupId))
                const querySnapshot = await getDocs(q)

                const membersData = []
                for (const docSnap of querySnapshot.docs) {
                    const member = docSnap.data()
                    // Fetch profile for each member
                    const profileRef = doc(db, 'profiles', member.user_id)
                    const profileSnap = await getDoc(profileRef)

                    if (profileSnap.exists()) {
                        membersData.push({
                            id: docSnap.id,
                            ...member,
                            profiles: {
                                id: profileSnap.id,
                                ...profileSnap.data()
                            }
                        })
                    }
                }

                setMembers(membersData)
            } catch (err) {
                console.error('Error fetching members:', err)
            }
        }

        fetchGroupData()
        fetchMembers()
    }, [groupId])

    const copyGroupKey = () => {
        navigator.clipboard.writeText(group.group_key)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/')
        } catch (err) {
            console.error('Logout failed:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                            <Moon className="h-8 w-8 text-blue-600" />
                            <span className="text-2xl font-bold text-gray-900">Suhoor</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-600 hover:text-red-600 transition"
                            title="Sign Out"
                        >
                            <LogOut className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-6 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {group?.name}
                                </h1>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">Group Key:</span>
                                    <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">
                                        {group?.group_key}
                                    </code>
                                    <button
                                        onClick={copyGroupKey}
                                        className="p-1 hover:bg-gray-100 rounded transition"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Copy className="h-4 w-4 text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <UserPlus className="h-5 w-5" />
                                <span>Invite Member</span>
                            </button>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>Members ({members.length})</span>
                            </h3>
                            <div className="grid gap-3">
                                {members.map(member => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {member.profiles.display_name || member.profiles.email}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {member.profiles.email}
                                            </div>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${member.role === 'admin'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-200 text-gray-700'
                                                }`}
                                        >
                                            {member.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <WakeUpTracker groupId={groupId} members={members} />
                </div>
            </main>

            {showInviteModal && (
                <InviteMemberModal
                    groupId={groupId}
                    onClose={() => setShowInviteModal(false)}
                />
            )}
        </div>
    )
}
