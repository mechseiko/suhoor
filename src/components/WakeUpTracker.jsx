import { useState, useEffect, useCallback } from 'react'
import { Bell, CheckCircle, Moon, Volume2, VolumeX } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'

export default function WakeUpTracker({ groupId, members }) {
    const { currentUser } = useAuth()
    const { isConnected, joinGroup, leaveGroup, emitWakeUp, on, off } = useSocket()
    const [wakeUpLogs, setWakeUpLogs] = useState([])
    const [hasWokenUp, setHasWokenUp] = useState(false)
    const [loading, setLoading] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [onlineMembers, setOnlineMembers] = useState([])

    // Get current user's display name
    const getCurrentUserName = useCallback(() => {
        const member = members.find(m => m.profiles.id === currentUser.uid)
        return member?.profiles?.display_name || currentUser.email
    }, [members, currentUser])

    // Fetch today's wake-up logs from Firestore
    const fetchTodayLogs = useCallback(async () => {
        try {
            const today = new Date().toISOString().split('T')[0]

            const logsRef = collection(db, 'wake_up_logs')
            const q = query(
                logsRef,
                where('group_id', '==', groupId),
                where('date', '==', today)
            )
            const querySnapshot = await getDocs(q)

            const logsData = []
            querySnapshot.forEach((doc) => {
                logsData.push({ id: doc.id, ...doc.data() })
            })

            setWakeUpLogs(logsData)
            setHasWokenUp(
                logsData.some(log => log.user_id === currentUser.uid) || false
            )
        } catch (err) {
            console.error('Error fetching wake up logs:', err)
        }
    }, [groupId, currentUser.uid])

    // Join group room when component mounts
    useEffect(() => {
        fetchTodayLogs()

        if (isConnected) {
            const userName = getCurrentUserName()
            joinGroup(groupId, userName)
        }

        return () => {
            if (isConnected) {
                leaveGroup(groupId)
            }
        }
    }, [groupId, isConnected, joinGroup, leaveGroup, getCurrentUserName, fetchTodayLogs])

    // Play notification sound
    const playNotificationSound = useCallback(() => {
        if (!soundEnabled) return

        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
    }, [soundEnabled])

    // Listen for real-time wake-up events
    useEffect(() => {
        if (!isConnected) return

        const handleMemberWokeUp = (data) => {
            console.log('🌅 Member woke up:', data)

            // Update local state immediately
            setWakeUpLogs(prev => {
                // Check if this wake-up is already logged
                const exists = prev.some(log =>
                    log.user_id === data.userId &&
                    log.woke_up_at === data.wakeUpTime
                )

                if (exists) return prev

                const today = new Date().toISOString().split('T')[0]
                return [...prev, {
                    user_id: data.userId,
                    group_id: groupId,
                    date: today,
                    woke_up_at: data.wakeUpTime
                }]
            })

            // Check if it's the current user
            if (data.userId === currentUser.uid) {
                setHasWokenUp(true)
            } else {
                // Play sound for other members waking up
                playNotificationSound()
            }
        }

        const handleGroupMembersUpdate = (data) => {
            console.log('👥 Online members updated:', data)
            setOnlineMembers(data.onlineMembers || [])
        }

        on('member-woke-up', handleMemberWokeUp)
        on('group-members-update', handleGroupMembersUpdate)

        return () => {
            off('member-woke-up', handleMemberWokeUp)
            off('group-members-update', handleGroupMembersUpdate)
        }
    }, [isConnected, on, off, groupId, currentUser.uid, playNotificationSound])

    // Handle wake-up button click
    const handleWakeUp = async () => {
        setLoading(true)
        try {
            const today = new Date().toISOString().split('T')[0]
            const wakeUpTime = new Date().toISOString()

            // Save to Firestore
            await addDoc(collection(db, 'wake_up_logs'), {
                user_id: currentUser.uid,
                group_id: groupId,
                date: today,
                woke_up_at: wakeUpTime,
            })

            // Emit Socket.IO event for real-time update
            const userName = getCurrentUserName()
            emitWakeUp(groupId, userName, wakeUpTime)

            // Update local state
            setHasWokenUp(true)
        } catch (err) {
            console.error('Error logging wake up:', err)
        } finally {
            setLoading(false)
        }
    }

    const getWakeUpStatus = userId => {
        return wakeUpLogs.some(log => log.user_id === userId)
    }

    const isOnline = userId => {
        return onlineMembers.includes(userId)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h3 className="md:text-xl text-lg font-bold text-dark flex items-center space-x-2">
                        <Moon className="h-6 w-6 text-primary" />
                        <span>Today's Wake Up Tracker</span>
                    </h3>
                    {isConnected && (
                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Live
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={soundEnabled ? 'Mute notifications' : 'Enable notifications'}
                    >
                        {soundEnabled ? (
                            <Volume2 className="h-5 w-5 text-gray-600" />
                        ) : (
                            <VolumeX className="h-5 w-5 text-gray-400" />
                        )}
                    </button>
                    {!hasWokenUp ? (
                        <button
                            onClick={handleWakeUp}
                            disabled={loading || !isConnected}
                            className="flex items-center md:space-x-2 space-x-1 w-full px-2 md:px-4 md:py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Bell className="h-5 w-5" />
                            <span>{loading ? 'Logging...' : "I'm Awake!"}</span>
                        </button>
                    ) : (
                        <div className="flex items-center space-x-2 text-accent">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">You're awake!</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {members.map(member => {
                    const isAwake = getWakeUpStatus(member.profiles.id)
                    const memberOnline = isOnline(member.profiles.id)
                    const wakeUpTime = wakeUpLogs.find(
                        log => log.user_id === member.profiles.id
                    )?.woke_up_at

                    return (
                        <div
                            key={member.id}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${isAwake
                                ? 'bg-accent/10 border-accent/30 shadow-sm'
                                : 'bg-muted/30 border-muted'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div
                                        className={`w-3 h-3 rounded-full ${isAwake ? 'bg-accent' : 'bg-muted'
                                            }`}
                                    ></div>
                                    {memberOnline && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium text-dark flex items-center gap-2">
                                        {member.profiles.display_name || member.profiles.email}
                                        {memberOnline && (
                                            <span className="text-xs text-green-600 font-normal">(online)</span>
                                        )}
                                    </div>
                                    {isAwake && wakeUpTime && (
                                        <div className="text-sm text-dark/60">
                                            Woke up at{' '}
                                            {new Date(wakeUpTime).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {isAwake && <CheckCircle className="h-5 w-5 text-accent" />}
                        </div>
                    )
                })}
            </div>

            {wakeUpLogs.length === 0 && (
                <div className="text-center py-8 text-dark/50">
                    No one has woken up yet today.
                </div>
            )}

        </div>
    )
}
