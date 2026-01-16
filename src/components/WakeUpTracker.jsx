import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, CheckCircle, Volume2, VolumeX, MapPin } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useFastingTimes } from '../hooks/useFastingTimes'
import { useLocationTracking } from '../hooks/useLocationTracking'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore'
// GroupAnalytics removed
import { Users, Crown } from 'lucide-react'

export default function WakeUpTracker({ groupId, members }) {
    // Create a map to store unique members, prioritizing admins
    const uniqueMembersMap = new Map();
    members.forEach(member => {
        const existing = uniqueMembersMap.get(member.profiles.id);
        if (!existing || (member.role === 'admin' && existing.role !== 'admin')) {
            uniqueMembersMap.set(member.profiles.id, member);
        }
    });

    // Override members with uniqueMembers for the rest of the component
    members = Array.from(uniqueMembersMap.values());

    const { currentUser } = useAuth()
    const { isConnected, joinGroup, leaveGroup, emitWakeUp, buzzUser, on, off } = useSocket()
    const { todayData } = useFastingTimes();
    const [wantsToFast, setWantsToFast] = useState(true) // Default to true

    // State declarations moved to top to prevent ReferenceError
    const [userLocations, setUserLocations] = useState({})
    const [wakeUpLogs, setWakeUpLogs] = useState([])
    const [hasWokenUp, setHasWokenUp] = useState(false)
    const [isBuzzing, setIsBuzzing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [onlineMembers, setOnlineMembers] = useState([])
    const audioRef = useRef(null)

    // Fetch fasting status for the target date
    useEffect(() => {
        const fetchFastingStatus = async () => {
            if (!todayData?.date) return

            // We need to check status for the date of Suhoor.
            // If Suhoor is 'tomorrow' relative to check time (e.g. checked at 8 PM), we need that date.
            // But todayData from API usually returns 'today's' fasting times.
            // Ideally we check specific date string associated with the Suhoor time.
            // For now, let's use the date provided by todayData data.
            // NOTE: The prompt saves for 'tomorrow'. We need to align these.
            // If prompt saved for 2024-01-20, and todayData says date is 2024-01-20.

            try {
                // Try to find status for today's Suhoor date (or tomorrow's if late)
                // Simplification: Check for the date in todayData
                const targetDate = todayData.date
                const docRef = doc(db, 'daily_fasting_status', `${groupId}_${currentUser.uid}_${targetDate}`)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setWantsToFast(docSnap.data().wantsToFast)
                }
            } catch (e) {
                console.error("Error fetching fasting status for tracker", e)
            }
        }
        fetchFastingStatus()
    }, [todayData, groupId, currentUser.uid])

    // Re-calculate isWakeUpWindow locally with Interval to ensure accuracy
    const [isInWindow, setIsInWindow] = useState(false)
    useEffect(() => {
        if (!todayData?.time?.sahur) return

        const checkTime = () => {
            const [hours, minutes] = todayData.time.sahur.split(':').map(Number)
            const now = new Date()
            const suhoorDate = new Date()
            suhoorDate.setHours(hours, minutes, 0, 0)

            // Handle day wrapping if needed (if Suhoor is early morning and we are checking late previous night?)
            // Usually Suhoor is AM. If now is PM (e.g. 23:00) and Suhoor is 04:00.
            // suhoorDate would be set to "Today 04:00" which is in past.
            // So if suhoorDate < now, add 1 day.
            if (suhoorDate < now && (now.getHours() > 12)) {
                suhoorDate.setDate(suhoorDate.getDate() + 1)
            }

            const diffMs = suhoorDate - now
            const diffMins = diffMs / 1000 / 60

            // Window: 15 mins before Suhoor
            const active = diffMins > 0 && diffMins <= 15
            setIsInWindow(active)

            // Trigger automatic buzz
            if (active && !hasWokenUp && wantsToFast && !isBuzzing) {
                setIsBuzzing(true)
            }
        }

        const interval = setInterval(checkTime, 10000) // Check every 10s
        checkTime() // Initial check
        return () => clearInterval(interval)
    }, [todayData, hasWokenUp, wantsToFast, isBuzzing])

    useLocationTracking(groupId, currentUser.uid, isInWindow && !hasWokenUp && wantsToFast)

    // Track location if in window and NOT woken up
    // ... existing logs fetching ...

    // Get current user's display name

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
        if (!isInWindow) return

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
    }, [groupId, isInWindow])

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

            setIsBuzzing(false) // Stop current buzzing

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

            // Local Notification for success
            if (Capacitor.isNativePlatform()) {
                await LocalNotifications.schedule({
                    notifications: [{
                        title: 'Alhamdulillah! 🌅',
                        body: 'You are logged as awake. May Allah accept your fast.',
                        id: new Date().getTime(),
                        schedule: { at: new Date(Date.now() + 500) }
                    }]
                })
            }

            // Schedule "Double Check" alarm in 5 minutes
            // "come again 5 minutes after... just to check if the person is truly awake"
            if (Capacitor.isNativePlatform()) {
                LocalNotifications.schedule({
                    notifications: [{
                        title: 'Just Checking!',
                        body: 'Are you still awake for Suhoor?',
                        id: new Date().getTime() + 1, // Unique ID
                        sound: 'beep.wav',
                        schedule: { at: new Date(Date.now() + 5 * 60 * 1000) }, // 5 minutes
                        actionTypeId: "",
                        extra: { type: 'double_check' }
                    }]
                })
            }

            // In-app "Double Check" timer
            setTimeout(() => {
                setHasWokenUp(false) // Reset state to force "I'm Awake" again? 
                // Or better, introduce a "confirmation_pending" state.
                // For simplicity/robustness as per user request "buzz alarm... will come again":
                // We can just set `isBuzzing(true)` and maybe show a specific "Confirm you are still up" message.
                // But simply setting `isBuzzing(true)` works well as it re-triggers the loop.
                // However, we need to distinguish between "woken up" and "confirmed".
                // If we reset `hasWokenUp` to false, it re-enables the main button which fits the flow.
                // But we already logged it to DB. Duplicate logs? 
                // Maybe we only re-trigger buzz visually/audibly but don't require re-logging? or update log?

                // User said "come again". Let's assume re-buzzing.
                // To avoid complexity, we can just trigger the buzz and show a "Verify Awareness" modal or similar.
                // Or just reset `isBuzzing` to true. 
                // BUT `isBuzzing` logic checks `!hasWokenUp` in the interval!
                // So I need to modify the interval check or `hasWokenUp` logic.

                // Let's rely on the native notification for the "come again" if app is closed.
                // If app is OPEN:
                setIsBuzzing(true)
            }, 5 * 60 * 1000)

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

    const UnifiedMemberList = () => {
        return (
            <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Group Members
                        </h3>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                            {members.length}
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {loading && !members.length ? (
                            <div className="p-4 space-y-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                                        <div className="space-y-1">
                                            <div className="w-24 h-3 bg-gray-100 animate-pulse rounded" />
                                            <div className="w-32 h-2 bg-gray-50 animate-pulse rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            members.map(member => {
                                const isAwake = getWakeUpStatus(member.profiles.id)
                                const memberOnline = isOnline(member.profiles.id)
                                const wakeUpTime = wakeUpLogs.find(
                                    log => log.user_id === member.profiles.id
                                )?.woke_up_at
                                const location = userLocations[member.profiles.id]
                                const hasLocation = !!location

                                return (
                                    <div
                                        key={member.id}
                                        className={`p-4 transition-colors flex items-center justify-between group ${isAwake ? 'bg-accent/5' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {member.profiles.display_name?.charAt(0).toUpperCase() || member.profiles.email?.charAt(0).toUpperCase()}
                                                </div>
                                                {memberOnline && (
                                                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                                                    {member.profiles.display_name || member.profiles.email.split('@')[0]}
                                                    {member.role === 'admin' && (
                                                        <Crown className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                    )}
                                                    {isAwake && <CheckCircle className="h-3.5 w-3.5 text-accent" />}
                                                </div>
                                                <div className="text-[11px] text-gray-500 flex items-center gap-2">
                                                    {member.profiles.email}
                                                    {isAwake && wakeUpTime && (
                                                        <span className="text-accent font-medium">
                                                            • {new Date(wakeUpTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                                {hasLocation && isInWindow && !isAwake && (
                                                    <a
                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-1 flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        <MapPin className="h-3 w-3" />
                                                        <span>Live Location Path</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!isAwake && memberOnline && member.profiles.id !== currentUser.uid && (
                                                <button
                                                    onClick={() => buzzUser(member.profiles.id, groupId, getCurrentUserName())}
                                                    className="p-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors flex items-center gap-2 cursor-pointer"
                                                    title={`Buzz ${member.profiles.display_name || member.profiles.email}`}
                                                >
                                                    <Bell className="h-3.5 w-3.5 animate-bounce" />
                                                    <span className="text-[10px] font-bold uppercase">Buzz</span>
                                                </button>
                                            )}
                                            {hasLocation && isInWindow && !isAwake && (
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                    title="Navigate to member"
                                                >
                                                    <MapPin className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm md:p-6 p-4 border border-gray-100">
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
                    {isInWindow && !hasWokenUp && wantsToFast && (
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

            <UnifiedMemberList />

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
                            className="w-full max-w-md bg-white text-red-600 px-8 py-6 rounded-3xl text-2xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                        >
                            I'M AWAKE!
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
