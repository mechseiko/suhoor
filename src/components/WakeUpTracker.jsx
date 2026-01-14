import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, CheckCircle, Volume2, VolumeX, MapPin } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useFastingTimes } from '../hooks/useFastingTimes'
import { useLocationTracking } from '../hooks/useLocationTracking'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'
import GroupAnalytics from './GroupAnalytics'
import { Users, Crown } from 'lucide-react'

export default function WakeUpTracker({ groupId, members }) {
    const { currentUser } = useAuth()
    const { isConnected, joinGroup, leaveGroup, emitWakeUp, buzzUser, on, off } = useSocket()
    const { isWakeUpWindow } = useFastingTimes();
    const [userLocations, setUserLocations] = useState({})


    // Track location if in window and NOT woken up
    const [wakeUpLogs, setWakeUpLogs] = useState([])
    const [hasWokenUp, setHasWokenUp] = useState(false)

    useLocationTracking(groupId, currentUser.uid, isWakeUpWindow && !hasWokenUp)
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

        if (Capacitor.isNativePlatform()) {
            LocalNotifications.requestPermissions();
        }

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

    const [isBuzzing, setIsBuzzing] = useState(false)
    const audioRef = useRef(null)

    // Handle persistent buzzing sound
    useEffect(() => {
        let interval;
        if (isBuzzing) {
            // Play sound immediately
            playNotificationSound()

            // Loop it every 1 second
            interval = setInterval(() => {
                playNotificationSound()
                if (Capacitor.isNativePlatform()) {
                    LocalNotifications.schedule({
                        notifications: [{
                            title: 'WAKE UP!',
                            body: 'Someone is trying to wake you up!',
                            id: new Date().getTime(),
                            sound: 'beep.wav',
                            schedule: { at: new Date(Date.now() + 100) },
                            actionTypeId: "",
                            extra: null
                        }]
                    })
                }
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isBuzzing, playNotificationSound])

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
                // Play sound for other members waking up one time
                if (!isBuzzing) playNotificationSound()
            }
        }

        const handleGroupMembersUpdate = (data) => {
            console.log('👥 Online members updated:', data)
            setOnlineMembers(data.onlineMembers || [])
        }

        const handleGotBuzzed = (data) => {
            console.log("GOT BUZZED BY", data.fromUserName)
            setIsBuzzing(true)
        }

        on('member-woke-up', handleMemberWokeUp)
        on('group-members-update', handleGroupMembersUpdate)
        on('get-buzzed', handleGotBuzzed)

        return () => {
            off('member-woke-up', handleMemberWokeUp)
            off('group-members-update', handleGroupMembersUpdate)
            off('get-buzzed', handleGotBuzzed)
        }
    }, [isConnected, on, off, groupId, currentUser.uid, playNotificationSound, isBuzzing])

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

    const RightSidebar = () => {
        return(        
        <div className="space-y-6 mb-5">
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
    )}

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h3 className="md:text-xl font-bold text-dark">
                        <span>Wake Up Tracker</span>
                    </h3>
                    
                    {isConnected && (
                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Live
                        </span>
                    )}
                    {isWakeUpWindow && !hasWokenUp && (
                        <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200 flex items-center gap-1">
                            <MapPin className="w-3 h-3 animate-bounce" />
                            Sharing Location
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
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
                            className="flex items-center cursor-pointer md:space-x-2 space-x-1 w-full px-2 py-2 md:px-4 md:py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

            <RightSidebar />

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
                            <div className="flex items-center gap-2">
                                {!isAwake && memberOnline && member.profiles.id !== currentUser.uid && (
                                    <button
                                        onClick={() => buzzUser(member.profiles.id, groupId, getCurrentUserName())}
                                        className="p-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors flex items-center gap-2"
                                        title={`Buzz ${member.profiles.display_name || member.profiles.email}`}
                                    >
                                        <Bell className="h-4 w-4 animate-bounce" />
                                        <span className="text-xs font-bold uppercase tracking-tighter">Buzz</span>
                                    </button>
                                )}
                                {isAwake && <CheckCircle className="h-5 w-5 text-accent" />}
                            </div>
                        </div>
                    )
                })}
            </div>

            {wakeUpLogs.length === 0 && (
                <div className="text-center py-8 text-dark/50">
                    No one has woken up yet today.
                </div>
            )}

            {isBuzzing && (
                <div className="fixed inset-0 z-[100] bg-red-600/95 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                    <div className="text-white text-center space-y-8">
                        <Bell className="h-32 w-32 animate-bounce mx-auto" />
                        <h1 className="text-6xl font-black uppercase tracking-tighter">WAKE UP!</h1>
                        <p className="text-2xl font-medium opacity-90">Your group needs you for Suhoor!</p>

                        <button
                            onClick={() => setIsBuzzing(false)}
                            className="w-full max-w-md bg-white text-red-600 px-8 py-6 rounded-3xl text-2xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                        >
                            I'M AWAKE!
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
