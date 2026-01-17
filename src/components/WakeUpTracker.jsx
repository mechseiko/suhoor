import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, CheckCircle, Volume2, VolumeX, MapPin, Trash2, Calendar, X, Clock } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useFastingTimes } from '../hooks/useFastingTimes'
import { useLocationTracking } from '../hooks/useLocationTracking'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, addDoc, doc, getDoc, deleteDoc } from 'firebase/firestore'
// GroupAnalytics removed
import { Users, Crown } from 'lucide-react'

export default function WakeUpTracker({ groupId, members, onMemberRemoved, groupName }) {
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
    const [showActions, setShowActions] = useState(false)

    // State declarations moved to top to prevent ReferenceError
    const [userLocations, setUserLocations] = useState({})
    const [wakeUpLogs, setWakeUpLogs] = useState([])
    const [hasWokenUp, setHasWokenUp] = useState(false)
    const [isBuzzing, setIsBuzzing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [onlineMembers, setOnlineMembers] = useState([])
    const [isInWindow, setIsInWindow] = useState(false)
    const [showDateModal, setShowDateModal] = useState(false)
    const [dateInput, setDateInput] = useState('')
    const [dateError, setDateError] = useState('')
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
                const targetDate = todayData.date // This should already be local date string if useFastingTimes is updated
                const docRef = doc(db, 'daily_fasting_status', `${currentUser.uid}_${targetDate}`)
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
    useEffect(() => {
        const checkTime = () => {
            const now = new Date()
            let targetHour, targetMinute

            // Use custom wake up time if available, otherwise 15 mins before Suhoor
            const userProfile = members.find(m => m.profiles.id === currentUser.uid)?.profiles
            if (userProfile?.customWakeUpTime) {
                [targetHour, targetMinute] = userProfile.customWakeUpTime.split(':').map(Number)
            } else if (todayData?.time?.sahur) {
                const [suhoorH, suhoorM] = todayData.time.sahur.split(':').map(Number)
                const suhoorTime = new Date()
                suhoorTime.setHours(suhoorH, suhoorM, 0, 0)
                suhoorTime.setMinutes(suhoorTime.getMinutes() - 15)
                targetHour = suhoorTime.getHours()
                targetMinute = suhoorTime.getMinutes()
            } else {
                return
            }

            const targetTime = new Date()
            targetTime.setHours(targetHour, targetMinute, 0, 0)

            // Handle day wrapping
            if (targetTime < now && (now.getHours() > 12)) {
                targetTime.setDate(targetTime.getDate() + 1)
            }

            const diffMs = targetTime - now
            const diffMins = diffMs / 1000 / 60

            // Window: active from the target time until Suhoor (or just a fixed duration)
            // Let's say window stays active for 1 hour after target time or until clicked
            const active = diffMins <= 0 && diffMins >= -60 // Active for 60 mins after target time
            setIsInWindow(active)

            // Trigger automatic buzz
            if (active && !hasWokenUp && wantsToFast && !isBuzzing) {
                setIsBuzzing(true)
            }
        }

        const interval = setInterval(checkTime, 10000)
        checkTime()
        return () => clearInterval(interval)
    }, [todayData, hasWokenUp, wantsToFast, isBuzzing, members, currentUser.uid])

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
            const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

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
    const handleWakeUpClick = () => {
        setShowDateModal(true)
        setDateInput('')
        setDateError('')
    }

    const validateAndWakeUp = async () => {
        // Expected format: MM-DD-YYYY or MM DD YYYY etc. 
        // User said: "01-13-2026 will type 0 1 1 3 20 2 5"
        // Let's normalize both to digits only for comparison
        const today = new Date()
        const expected = today.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        }).replace(/\D/g, '')

        const inputDigits = dateInput.replace(/\D/g, '')

        if (inputDigits !== expected) {
            setDateError('Incorrect date. Please type the full current date (MM DD YYYY).')
            return
        }

        setShowDateModal(false)
        setLoading(true)
        try {
            const todayStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
            const wakeUpTime = new Date().toISOString()

            setIsBuzzing(false) // Stop current buzzing

            // Save to Firestore
            await addDoc(collection(db, 'wake_up_logs'), {
                user_id: currentUser.uid,
                group_id: groupId,
                date: todayStr,
                woke_up_at: wakeUpTime,
            })

            // Emit Socket.IO event
            const userName = getCurrentUserName()
            emitWakeUp(groupId, userName, wakeUpTime)

            setHasWokenUp(true)

            if (Capacitor.isNativePlatform()) {
                await LocalNotifications.schedule({
                    notifications: [{
                        title: 'Alhamdulillah! 🌅',
                        body: 'You are logged as awake.',
                        id: new Date().getTime(),
                        schedule: { at: new Date(Date.now() + 500) }
                    }]
                })
            }

            // Schedule "Double Check" alarm in 5 minutes
            setTimeout(() => {
                // To allow re-buzzing, we can set hasWokenUp back to false 
                // but keep the record in DB. The UI will show them as awake to others,
                // but "isBuzzing" will trigger for them again.
                setHasWokenUp(false)
                setIsBuzzing(true)
            }, 5 * 60 * 1000)

        } catch (err) {
            console.error('Error logging wake up:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveMember = async (memberId, memberName) => {
        if (!window.confirm(`Are you sure you want to remove ${memberName} from the group?`)) return

        try {
            await deleteDoc(doc(db, 'group_members', memberId))
            onMemberRemoved?.()
        } catch (err) {
            console.error('Error removing member:', err)
            alert('Failed to remove member')
        }
    }

    const isCurrentUserAdmin = members.find(m => m.profiles.id === currentUser.uid)?.role === 'admin'

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
                        {members.length > 1 && <button onClick={() => setShowActions(!showActions)} title={`${showActions ? 'Hide Action' : 'Show Action'}`} className="text-[10px] cursor-pointer font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                            {showActions ? 'Hide' : 'Admin Actions'}
                        </button>}
                    </div>
                    <div className="divide-y divide-gray-50">
                        {loading && !members.length ? (
                            <div className="p-4 space-y-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
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
                                                    {member.role === 'admin' && <span className='text-primary'>{' '} (Admin)</span>}
                                                    {isAwake && <CheckCircle className="h-3.5 w-3.5 text-accent" />}
                                                </div>
                                                <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-2">
                                                    {member.profiles.email}
                                                    {member.profiles.customWakeUpTime && (
                                                        <span className="text-yellow-600 font-bold bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100 flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {member.profiles.customWakeUpTime}
                                                        </span>
                                                    )}
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
                                            {isCurrentUserAdmin && member.profiles.id !== currentUser.uid && showActions && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.id, member.profiles.display_name || member.profiles.email)}
                                                    className="p-2 text-xs flex items-center gap-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove
                                                </button>
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
                            onClick={handleWakeUpClick}
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
                <div className="text-center py-4 text-dark/50">
                    No one has woken up yet today.
                </div>
            )}

            {isBuzzing && (
                <div className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                    <div className="text-white text-center space-y-8">
                        <Bell className="h-32 w-32 animate-bounce mx-auto" />
                        <h1 className="text-6xl font-black uppercase tracking-tighter">WAKE UP!</h1>
                        <p className="text-2xl font-medium opacity-90">{groupName} is waking you for Suhoor!</p>

                        <button
                            onClick={handleWakeUpClick}
                            className="w-full max-w-md bg-white text-primary px-8 py-6 rounded-lg text-2xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                        >
                            I am Awake
                        </button>
                    </div>
                </div>
            )}

            {showDateModal && (
                <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">
                                Awareness Verification
                            </h3>
                            <button onClick={() => setShowDateModal(false)} className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-600 text-sm">
                                To confirm you're truly awake and alert, please type today's date in full (MM DD YYYY).
                            </p>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Today's Date
                                </label>
                                <input
                                    type="text"
                                    value={dateInput}
                                    onChange={(e) => setDateInput(e.target.value)}
                                    placeholder="e.g. 01 13 2026"
                                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-lg text-lg placeholder:text-md font-black tracking-[0.2em] text-center focus:border-primary focus:bg-white transition-all outline-none"
                                />
                                {dateError && <p className="text-red-500 text-xs font-medium">{dateError}</p>}
                            </div>

                            <button
                                onClick={validateAndWakeUp}
                                disabled={loading}
                                className="w-full cursor-pointer hover:bg-pacity-90 py-4 bg-primary text-white rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Logging...' : 'I am Awake'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
