import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Users,
    UserPlus,
    Copy,
    Crown,
    CopyCheck
} from 'lucide-react'
import { db } from '../config/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import WakeUpTracker from '../components/WakeUpTracker'
import InviteMemberModal from '../components/InviteMemberModal'
import GroupAnalytics from '../components/GroupAnalytics'
import Loader from '../components/Loader'
import SkeletonLoader from '../components/SkeletonLoader'
import DashboardLayout from '../layouts/DashboardLayout'
import { useSocket } from '../context/SocketContext'

export default function GroupDetail() {
    const { groupId } = useParams()
    const navigate = useNavigate()
    const [group, setGroup] = useState(() => {
        const cached = localStorage.getItem(`suhoor_group_${groupId}`)
        return cached ? JSON.parse(cached) : null
    })
    const [members, setMembers] = useState(() => {
        const cached = localStorage.getItem(`suhoor_members_${groupId}`)
        return cached ? JSON.parse(cached) : []
    })
    const [loading, setLoading] = useState(!group)
    const [copied, setCopied] = useState(false)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [toast, setToast] = useState(null)

    const { socket, on, off, isConnected } = useSocket()

    // Function to fetch members (hoisted for reuse)
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
            localStorage.setItem(`suhoor_members_${groupId}`, JSON.stringify(membersData))
        } catch (err) {
            console.error('Error fetching members:', err)
        }
    }

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const groupRef = doc(db, 'groups', groupId)
                const groupSnap = await getDoc(groupRef)

                if (groupSnap.exists()) {
                    const groupData = { id: groupSnap.id, ...groupSnap.data() }
                    setGroup(groupData)
                    localStorage.setItem(`suhoor_group_${groupId}`, JSON.stringify(groupData))
                }
            } catch (err) {
                console.error('Error fetching group:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchGroupData()
        fetchMembers()
    }, [groupId])

    // Toast auto-hide
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [toast])

    // Socket listeners for real-time updates
    useEffect(() => {
        const handleMemberJoined = (data) => {
            console.log('New member joined:', data)
            setToast({ type: 'success', message: 'A new member has joined the group!' })
            fetchMembers()
        }

        const handleGroupUpdated = (data) => {
            console.log('Group updated:', data)
            setToast({ type: 'info', message: 'Group information updated.' })
            fetchGroupData()
        }

        if (isConnected) {
            on('member-joined', handleMemberJoined)
            on('group-updated', handleGroupUpdated)
        }

        return () => {
            off('member-joined', handleMemberJoined)
            off('group-updated', handleGroupUpdated)
        }
    }, [groupId, on, off, isConnected])

    const copyInviteLink = () => {
        setCopied(true)
        navigator.clipboard.writeText(`${window.location.origin}/dashboard?groupKey=${group.group_key}`)
        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    const rightSidebar = (
        <div className="space-y-6">
            <GroupAnalytics groupId={groupId} memberCount={members.length} />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Members
                    </h3>
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                        {members.length}
                    </span>
                </div>
                <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                    {loading && !members.length ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3">
                                    <SkeletonLoader variant="circle" width="w-8" height="h-8" />
                                    <div className="space-y-1">
                                        <SkeletonLoader width="w-24" height="h-3" />
                                        <SkeletonLoader width="w-32" height="h-2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        members.map(member => (
                            <div
                                key={member.id}
                                className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {member.profiles.display_name?.charAt(0).toUpperCase() || member.profiles.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                                            {member.profiles.display_name || member.profiles.email.split('@')[0]}
                                            {member.role === 'admin' && (
                                                <Crown className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-500 truncate max-w-[120px]">
                                            {member.profiles.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <DashboardLayout rightSidebar={rightSidebar}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <div className="flex md:flex-row flex-col md:items-center gap-3 mb-2">
                            <h1 className="md:text-2xl text-xl font-bold text-gray-900">
                                {group?.name}
                            </h1>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                                {members.length} {members.length === 1 ? 'Member' : 'Members'}
                            </span>
                            {isConnected && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-200 animate-pulse">
                                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                    Live
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                                <span className="text-sm text-gray-500">Group Key:</span>
                                <code className="font-mono font-bold text-gray-900">{group?.group_key}</code>
                            </div>
                            <button
                                onClick={copyInviteLink}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary rounded-xl hover:bg-blue-100 transition-colors font-medium text-sm"
                            >
                                {copied ? (
                                    <>
                                        <CopyCheck className="h-4 w-4" />
                                        <span>Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        <span>Copy Key</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 shadow-lg shadow-blue-200 transition-all font-medium"
                    >
                        <UserPlus className="h-5 w-5" />
                        <span>Invite Member</span>
                    </button>
                </div>
            </div>

            <WakeUpTracker groupId={groupId} members={members} />

            {showInviteModal && (
                <InviteMemberModal
                    groupId={groupId}
                    groupName={group?.name}
                    groupKey={group?.group_key}
                    onClose={() => setShowInviteModal(false)}
                />
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${toast.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-blue-100 text-blue-800'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <span className="text-sm font-mediu">{toast.message}</span>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
