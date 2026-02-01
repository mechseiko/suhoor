import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    CopyCheck,
    Users,
    Copy,
    UserPlus,
    Edit
} from 'lucide-react'
import { db } from '../config/firebase'
import { doc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore'
import { LogOut, Settings2 } from 'lucide-react'
import WakeUpTracker from '../components/WakeUpTracker'
import GroupAnalytics from '../components/GroupAnalytics'
import InviteMemberModal from '../components/InviteMemberModal'
import Loader from '../components/Loader'
import DashboardLayout from '../layouts/DashboardLayout'
import { useSocket } from '../context/SocketContext'
import { useFastingTimes } from '../hooks/useFastingTimes'
import { useAuth } from '../context/AuthContext'
import { setDoc, serverTimestamp } from 'firebase/firestore'
import Settings from './Settings'


export default function GroupDetail() {
    const { currentUser } = useAuth()
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
    const [isEditingName, setIsEditingName] = useState(false)
    const [newGroupName, setNewGroupName] = useState(group?.name || '')
    const [savingName, setSavingName] = useState(false)
    const [loading, setLoading] = useState(!group)
    const [copied, setCopied] = useState(false);
    const [copyInvite, setCopyInvite] = useState(false);
    const [showLeave, setShowLeave] = useState(false);
    const [clicked, setClicked] = useState('')
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [toast, setToast] = useState(null)
    const [userLocations, setUserLocations] = useState({})
    const [leavingGroup, setLeavingGroup] = useState(false)

    const { socket, on, off, isConnected } = useSocket()
    const { isWakeUpWindow } = useFastingTimes()

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

    const handleLeaveGroup = async () => {
        if (!window.confirm('Are you sure you want to leave this group?')) return

        try {
            setLeavingGroup(true)
            const membersRef = collection(db, 'group_members')
            const q = query(membersRef, where('group_id', '==', groupId), where('user_id', '==', currentUser.uid))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                await deleteDoc(doc(db, 'group_members', querySnapshot.docs[0].id))
                localStorage.removeItem(`suhoor_group_${groupId}`)
                localStorage.removeItem(`suhoor_members_${groupId}`)
                navigate('/groups')
            }
        } catch (err) {
            console.error('Error leaving group:', err)
            setToast({ type: 'error', message: 'Failed to leave group.' })
        } finally {
            setLeavingGroup(false)
        }
    }

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
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-primary hover:text-primary transition-all duration-200 font-medium text-[13px]"
                >
                    {copyInvite ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copyInvite ? 'Invite Link Copied' : 'Copy Invite Link'}</span>
                </button>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center cursor-pointer justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 hover:shadow-md hover:shadow-blue-200 transition-all duration-200 font-medium text-[13px]"
                >
                    <UserPlus className="h-5 w-5" />
                    <span>Invite Member</span>
                </button>
                {showLeave && <button
                    onClick={handleLeaveGroup}
                    disabled={leavingGroup}
                    className="flex items-center cursor-pointer justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 font-medium text-[13px] border border-red-100"
                    title="Leave Group"
                >
                    <LogOut className="h-4 w-4 hidden sm:inline" />
                    <span className="text-xs">Leave</span>
                </button>}
            </div>
        )
    }

    const handleSaveGroupName = async () => {
        if (!groupId || !newGroupName.trim()) return
        try {
            setSavingName(true)
            const groupRef = doc(db, 'groups', groupId)
            await updateDoc(groupRef, { name: newGroupName.trim() }) // [web:29]

            const updated = { ...group, name: newGroupName.trim() }
            setGroup(updated)
            localStorage.setItem(`suhoor_group_${groupId}`, JSON.stringify(updated))

            setIsEditingName(false)
            setToast({ type: 'success', message: 'Group name updated.' })
        } catch (err) {

            console.error('Error updating group name:', err)
            setToast({ type: 'info', message: 'Failed to update group name.' })
        } finally {
            setSavingName(false)
        }
    }


    return (
        <DashboardLayout>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-4 px-4 md:px-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                <div className="relative z-10">
                    <div>
                        <div className="flex md:flex-row flex-col md:items-center gap-3 mb-2">
                            <h1 className="md:text-2xl text-xl flex items-center gap-2 font-bold text-gray-900">
                                {isEditingName ? (
                                    <>
                                        <input
                                            autoFocus
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveGroupName()
                                                if (e.key === 'Escape') {
                                                    setIsEditingName(false)
                                                    setNewGroupName(group?.name || '')
                                                }
                                            }}
                                            className="border border-gray-300 rounded px-2 py-1 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <button
                                            disabled={savingName}
                                            onClick={handleSaveGroupName}
                                            className="text-xs px-2 py-1 cursor-pointer rounded bg-primary text-white hover:opacity-90 disabled:opacity-60"
                                        >
                                            {savingName ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditingName(false)
                                                setNewGroupName(group?.name || '')
                                            }}
                                            className="text-xs px-2 py-1 cursor-pointer rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span>{group?.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditingName(true)
                                                setNewGroupName(group?.name || '')
                                            }}
                                            className="text-primary cursor-pointer mb-3"
                                            title="Edit Group Name"
                                        >
                                            <Edit size={12} />
                                        </button>
                                    </>
                                )}
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
                                <div className='flex items-center gap-2'>
                                    <span className="px-3 py-1 w-fit bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                                        {members.length} {members.length === 1 ? 'Member' : 'Members'}
                                    </span>
                                    <span title={`${showLeave ? 'Hide Actions' : 'Show Actions'}`}><Settings2 className={`h-4 w-4 cursor-pointer ${showLeave ? 'text-primary' : ''}`} onClick={() => setShowLeave(!showLeave)}/></span>
                                </div>      
                            </div>
                            <GroupActions />
                        </div>
                    </div>
                </div>
            </div>

            <WakeUpTracker groupId={groupId} members={members} onMemberRemoved={fetchMembers} groupName={group?.name}/>

            <div className="mt-8">
                <GroupAnalytics groupId={groupId} memberCount={members.length} />
            </div>

            {showInviteModal && (
                <InviteMemberModal
                    groupId={groupId}
                    groupName={group?.name}
                    groupKey={group?.group_key}
                    onClose={() => setShowInviteModal(false)}
                />
            )}

            {toast && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
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
