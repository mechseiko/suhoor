import { useState, useEffect, useCallback } from 'react'
import { Bell, CheckCircle, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'

export default function WakeUpTracker({ groupId, members }) {
    const { currentUser } = useAuth()
    const [wakeUpLogs, setWakeUpLogs] = useState([])
    const [hasWokenUp, setHasWokenUp] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchTodayLogs()
    }, [fetchTodayLogs])

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

    const handleWakeUp = async () => {
        setLoading(true)
        try {
            const today = new Date().toISOString().split('T')[0]

            await addDoc(collection(db, 'wake_up_logs'), {
                user_id: currentUser.uid,
                group_id: groupId,
                date: today,
                woke_up_at: new Date().toISOString(),
            })

            await fetchTodayLogs()
        } catch (err) {
            console.error('Error logging wake up:', err)
        } finally {
            setLoading(false)
        }
    }

    const getWakeUpStatus = userId => {
        return wakeUpLogs.some(log => log.user_id === userId)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-dark flex items-center space-x-2">
                    <Moon className="h-6 w-6 text-primary" />
                    <span>Today's Wake Up Tracker</span>
                </h3>
                {!hasWokenUp ? (
                    <button
                        onClick={handleWakeUp}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition disabled:opacity-50"
                    >
                        <Bell className="h-5 w-5" />
                        <span>{loading ? 'Logging...' : "I'm Awake!"}</span>
                    </button>
                ) : (
                    <div className="flex items-center space-x-2 text-accent">>
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">You're awake!</span>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {members.map(member => {
                    const isAwake = getWakeUpStatus(member.profiles.id)
                    const wakeUpTime = wakeUpLogs.find(
                        log => log.user_id === member.profiles.id
                    )?.woke_up_at

                    return (
                        <div
                            key={member.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${isAwake
                                ? 'bg-accent/10 border-accent/30'
                                : 'bg-muted/30 border-muted'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div
                                    className={`w-3 h-3 rounded-full ${isAwake ? 'bg-accent' : 'bg-muted'
                                        }`}
                                ></div>
                                <div>
                                    <div className="font-medium text-dark">
                                        {member.profiles.display_name || member.profiles.email}
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
                    No one has woken up yet today. Be the first!
                </div>
            )}
        </div>
    )
}

