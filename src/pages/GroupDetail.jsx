import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Crown,
    CopyCheck,
    MapPin,
    Navigation,
    Users,
    Copy,
    UserPlus,
    Edit
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
import { useFastingTimes } from '../hooks/useFastingTimes'

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
    const [copied, setCopied] = useState(false);
    const [copyInvite, setCopyInvite] = useState(false);
    const [clicked, setClicked] = useState('')
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [toast, setToast] = useState(null)
    const [userLocations, setUserLocations] = useState({})

    const { socket, on, off, isConnected } = useSocket()
    const { isWakeUpWindow } = useFastingTimes()

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

    // Listen for location updates during wake-up window
    useEffect(() => {
        if (!isWakeUpWindow) return

        const locationsRef = collection(db, 'groups', groupId, 'locations')
        // Using onSnapshot for real-time updates
        import('firebase/firestore').then(({ onSnapshot }) => {
            const unsubscribe = onSnapshot(locationsRef, (snapshot) => {
                const locs = {}
                snapshot.forEach(doc => {
                    locs[doc.id] = doc.data()
                })
                setUserLocations(locs)
            })
            return unsubscribe
        })
    }, [groupId, isWakeUpWindow])

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    const GroupActions = () => {
        return (
            <div className="flex gap-3 justify-between *:cursor-pointer">
                <button
                    onClick={
                        () => {
                            setCopyInvite(true)
                            navigator.clipboard.writeText(`${window.location.origin}/groups?groupKey=${group.group_key}`)
                            setTimeout(() => {
                                setCopyInvite(false)
                            }, 2000)
                        }
                    }
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-primary hover:text-primary transition-all duration-200 font-medium text-sm"
                >
                    {copyInvite ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copyInvite ? 'Link Copied' : 'Copy Invite Link'}</span>
                </button>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center cursor-pointer justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 hover:shadow-md hover:shadow-blue-200 transition-all duration-200 font-medium text-sm"
                >
                    <UserPlus className="h-5 w-5" />
                    <span>Invite Member</span>
                </button>
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
                            {[1, 2, 3, 4, 5, 6].map(i => (
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
                        members.map(member => {
                            const location = userLocations[member.profiles.id]
                            const hasLocation = !!location

                            return (
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
                                            {hasLocation && isWakeUpWindow && (
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-1 flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    <MapPin className="h-3 w-3" />
                                                    <span>Live: {new Date(location.timestamp?.toDate ? location.timestamp.toDate() : location.device_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    {hasLocation && isWakeUpWindow && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="Navigate to member"
                                        >
                                            <Navigation className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <DashboardLayout rightSidebar={rightSidebar}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-4 px-4 md:px-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>

                <div className="relative z-10">
                    <div>
                        <div className="flex md:flex-row flex-col md:items-center gap-3 mb-2">
                            <h1 className="md:text-2xl text-xl flex font-bold text-gray-900">
                                <span>{group?.name}</span>
                                <span onClick={() => setShowInviteModal(true)} className="text-primary cursor-pointer" title="Edit Group Name">
                                    <Edit size='12' />
                                </span>
                            </h1>
                            {isConnected && (
                                <span className="inline-flex w-fit items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-200 animate-pulse">
                                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                    Live
                                </span>
                            )}
                        </div>

                        <div className="flex md:flex-row flex-col md:space-y-0 space-y-3 w-full justify-between mt-3">
                            <div className="flex items-center justify-between gap-3 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                                <div className='flex items-center'>
                                    <Users className="h-4 w-4 mr-2 text-primary" />
                                    <div className='flex justify-between items-center gap-1'>
                                        <span className="font-mono text-gray-700">{group.group_key}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCopied(true);
                                                setClicked(group.id)
                                                navigator.clipboard.writeText(`${group.group_key}`)
                                                setTimeout(() => {
                                                    setCopied(false)
                                                }, 2000)
                                            }}
                                            className="ml-auto cursor-pointer p-1.5 hover:bg-white rounded-md text-gray-400 hover:text-primary transition-colors"
                                            title="Copy Group Key"
                                        >
                                            {copied && (clicked === group.id) ? <div className='flex gap-2 items-center text-xs'><CopyCheck className="h-4 w-4" /><span>Copied</span></div> : <Copy className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <span className="px-3 py-1 w-fit bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                                    {group.member_count || 0} {group.member_count === 1 ? 'Member' : 'Members'}
                                </span>
                            </div>
                            <GroupActions />
                        </div>
                    </div>
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

            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${toast.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-blue-100 text-blue-800'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
