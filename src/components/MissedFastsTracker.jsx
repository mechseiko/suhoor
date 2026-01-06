import { useState, useEffect } from 'react'
import { Calendar, Plus, Minus, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export default function MissedFastsTracker() {
    const { currentUser } = useAuth()
    const [stats, setStats] = useState({
        totalMissed: 0,
        madeUp: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFasts = async () => {
            if (!currentUser) return
            try {
                const docRef = doc(db, 'fasting_stats', currentUser.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setStats(docSnap.data())
                }
            } catch (err) {
                console.error('Error fetching fasting stats:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchFasts()
    }, [currentUser])

    const updateStats = async (field, val) => {
        const newStats = { ...stats, [field]: Math.max(0, stats[field] + val) }
        // Ensure madeUp doesn't exceed totalMissed? 
        // Actually, sometimes people make up fasts before logging them as missed? 
        // No, let's keep it simple.
        setStats(newStats)
        try {
            await setDoc(doc(db, 'fasting_stats', currentUser.uid), newStats)
        } catch (err) {
            console.error('Error updating fasting stats:', err)
        }
    }

    const remaining = Math.max(0, stats.totalMissed - stats.madeUp)

    if (loading) return null

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Missed Fasts</h3>
                        <p className="text-xs text-gray-500">Track your makeup fasts</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${remaining > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {remaining} remaining
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">Total Missed</span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => updateStats('totalMissed', -1)}
                            className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            <Minus className="h-4 w-4 text-gray-400" />
                        </button>
                        <span className="font-bold text-gray-900 w-4 text-center">{stats.totalMissed}</span>
                        <button
                            onClick={() => updateStats('totalMissed', 1)}
                            className="p-1 bg-purple-100 hover:bg-purple-200 rounded-md transition-colors"
                        >
                            <Plus className="h-4 w-4 text-purple-600" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">Made Up</span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => updateStats('madeUp', -1)}
                            className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            <Minus className="h-4 w-4 text-gray-400" />
                        </button>
                        <span className="font-bold text-gray-900 w-4 text-center">{stats.madeUp}</span>
                        <button
                            onClick={() => updateStats('madeUp', 1)}
                            className="p-1 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                        >
                            <Plus className="h-4 w-4 text-green-600" />
                        </button>
                    </div>
                </div>
            </div>

            {remaining === 0 && stats.totalMissed > 0 && (
                <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    All missed fasts have been made up!
                </div>
            )}

            {remaining > 0 && (
                <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    Don't forget to make up your missed fasts.
                </div>
            )}
        </div>
    )
}
