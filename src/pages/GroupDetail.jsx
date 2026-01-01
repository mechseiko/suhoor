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
    Shield,
    Crown
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import WakeUpTracker from '../components/WakeUpTracker'
import InviteMemberModal from '../components/InviteMemberModal'
import Loader from '../components/Loader'
import Logo from '../components/Logo'

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
        navigator.clipboard.writeText(`https://suhoor-group.web.app/dashboard/groups?groupKey=${group.group_key}`)
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
                <Loader />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <Logo />
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Sign Out"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {group?.name}
                                    </h1>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                                        {members.length} Members
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 mt-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                                        <span className="text-sm text-gray-500">Group Key:</span>
                                        <code className="font-mono font-bold text-gray-900">{group?.group_key}</code>
                                    </div>
                                    <button
                                        onClick={copyGroupKey}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary rounded-xl hover:bg-blue-100 transition-colors font-medium"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-4 w-4" />
                                                <span>Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4" />
                                                <span>Copy Group key</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                            >
                                <UserPlus className="h-5 w-5" />
                                <span>Invite Member</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content - Wake Up Tracker */}
                        <div className="lg:col-span-2">
                            <WakeUpTracker groupId={groupId} members={members} />
                        </div>

                        {/* Sidebar - Members List */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" />
                                        Members
                                    </h3>
                                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                                        {members.length} total
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {members.map(member => (
                                        <div
                                            key={member.id}
                                            className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold">
                                                    {member.profiles.display_name?.charAt(0).toUpperCase() || member.profiles.email?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 flex items-center gap-2">
                                                        {member.profiles.display_name || member.profiles.email.split('@')[0]}
                                                        {member.role === 'admin' && (
                                                            <Crown className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                                        {member.profiles.email}
                                                    </div>
                                                </div>
                                            </div>
                                            {member.role === 'admin' ? (
                                                <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg border border-yellow-100">
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    Member
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
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
