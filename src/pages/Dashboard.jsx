import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Users, TrendingUp, Award, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { doc, getDoc, setDoc, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore'
import StatsCard from '../components/StatsCard'
import FastingPrompt from '../components/FastingPrompt'
import DashboardLayout from '../layouts/DashboardLayout'
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                color: '#919BA1',
                padding: 20,
                font: {
                    size: 14,
                },
            },
        },
        tooltip: {
            backgroundColor: '#fff',
            titleColor: '#69757C',
            bodyColor: '#2F3437',
            padding: 10,
            borderColor: '#fff',
            borderWidth: 1,
        },
    },
    scales: {
        x: {
            ticks: {
                color: '#919BA1',
            },
            grid: {
                display: false,
            },
        },
        y: {
            ticks: {
                color: '#919BA1',
                stepSize: 1,
                precision: 0
            },
            grid: {
                color: '#919BA1',
                borderDash: [4, 4],
            },
            beginAtZero: true,
        },
    },
};


export default function Dashboard() {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams()
    const isNewUser = searchParams.get('m') === 'n'
    const [showWelcomeBanner, setShowWelcomeBanner] = useState(isNewUser)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [chartLoading, setChartLoading] = useState(false)

    const [groups, setGroups] = useState(() => {
        const cached = localStorage.getItem(`suhoor_groups_${currentUser?.uid}`)
        return cached ? JSON.parse(cached) : []
    })
    const [loading, setLoading] = useState(!groups.length)
    const [stats, setStats] = useState(() => {
        const cached = localStorage.getItem(`suhoor_stats_${currentUser?.uid}`)
        return cached ? JSON.parse(cached) : { totalGroups: 0, totalMembers: 0, activeToday: 0, consistency: 0, milestones: [] }
    })

    const [chartData, setChartData] = useState({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Fasting Days',
            data: new Array(12).fill(0),
            borderColor: '#10B981', // Green
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#10B981',
            pointBorderColor: '#fff',
        }, {
            label: 'My Activity',
            data: new Array(12).fill(0),
            borderColor: '#8B5CF6', // Purple
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#8B5CF6',
            pointBorderColor: '#fff',
            hidden: true
        }, {
            label: 'Groups Created',
            data: new Array(12).fill(0),
            borderColor: '#3B82F6', // Blue
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#fff',
        }]
    })

    const fetchActivity = async () => {
        try {
            const logsRef = collection(db, 'wake_up_logs')
            const q = query(logsRef, where('user_id', '==', currentUser.uid))
            const querySnapshot = await getDocs(q)

            const logs = []
            querySnapshot.forEach(doc => {
                logs.push(doc.data())
            })

            return logs
        } catch (err) {
            console.error("Error fetching activity:", err)
            return []
        }
    }

    const processChartData = async (groupsData) => {
        const creationCounts = new Array(12).fill(0)
        const activityCounts = new Array(12).fill(0)

        groupsData.forEach(group => {
            if (group.created_at) {
                let date;
                if (group.created_at.toDate) {
                    date = group.created_at.toDate();
                } else {
                    date = new Date(group.created_at);
                }

                if (!isNaN(date.getTime())) {
                    const monthIndex = date.getMonth();
                    creationCounts[monthIndex]++;
                }
            }
        })

        const logs = await fetchActivity()
        logs.forEach(log => {
            if (log.date) {
                const date = new Date(log.date)
                if (!isNaN(date.getTime())) {
                    const monthIndex = date.getMonth()
                    activityCounts[monthIndex]++
                }
            }
        })

        setChartData(prev => ({
            ...prev,
            datasets: [
                {
                    ...prev.datasets[0],
                    // Preserve existing fasting data
                },
                {
                    ...prev.datasets[1],
                    data: activityCounts, // My Activity (Purple)
                    hidden: false
                },
                {
                    label: 'Groups Created',
                    data: creationCounts,
                    borderColor: '#3B82F6', // Blue
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#fff',
                }
            ]
        }))
    }

    useEffect(() => {
        if (groups.length > 0) {
            processChartData(groups)
        }
    }, [groups])

    useEffect(() => {
        if (currentUser) {
            createOrUpdateProfile()
            fetchGroups()
        }
    }, [currentUser, selectedYear])

    const createOrUpdateProfile = async () => {
        try {
            const userRef = doc(db, 'profiles', currentUser.uid)
            const userSnap = await getDoc(userRef)

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    email: currentUser.email,
                    display_name: currentUser.email.split('@')[0],
                    created_at: new Date().toISOString()
                })
            }
        } catch (err) {
            console.error('Error with profile:', err)
        }
    }

    const todayDateLocal = new Date().toLocaleDateString('en-CA')

    const fetchFastingStats = async () => {
        try {
            const fastingRef = collection(db, 'daily_fasting_status')
            const q = query(fastingRef, where('userId', '==', currentUser.uid))
            const querySnapshot = await getDocs(q)

            const fastingLogs = []
            querySnapshot.forEach((doc) => {
                fastingLogs.push(doc.data())
            })

            // Calculate active streak
            // Sort by date descending
            fastingLogs.sort((a, b) => new Date(b.date) - new Date(a.date))

            let streak = 0
            const today = new Date().toLocaleDateString('en-CA')
            const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA')

            // Check if fasted today or yesterday to start streak
            // Simple logic: consecutive days where wantsToFast is true
            // If they haven't answered for today yet, streak continues from yesterday?
            // Let's count consecutive "true" entries from top.

            // Re-sort ascending to build calendar or descending for streak?
            // Descending is easier for "current" streak.

            // Filter only true values? No, a 'false' breaks streak.

            // This is complex because dates might be missing.
            // Simplified: Count most recent consecutive block of dates.

            let currentCheckDate = new Date()
            let streakCount = 0
            let keepChecking = true

            // Map dates to status
            const dateMap = {}
            fastingLogs.forEach(log => {
                dateMap[log.date] = log.wantsToFast
            })

            while (keepChecking) {
                const dateStr = currentCheckDate.toLocaleDateString('en-CA')
                if (dateMap[dateStr] === true) {
                    streakCount++
                    currentCheckDate.setDate(currentCheckDate.getDate() - 1)
                } else if (dateMap[dateStr] === false) {
                    keepChecking = false
                } else {
                    // Entry missing.
                    // If it's TODAY and missing, we check YESTERDAY.
                    // If it's older than today and missing, streak breaks.
                    if (dateStr === today) {
                        currentCheckDate.setDate(currentCheckDate.getDate() - 1)
                    } else {
                        keepChecking = false
                    }
                }
            }

            // Update Graph Data (Monthly Fasting Count)
            const fastingCounts = new Array(12).fill(0)
            fastingLogs.forEach(log => {
                if (log.wantsToFast) {
                    const date = new Date(log.date)
                    if (!isNaN(date.getTime()) && date.getFullYear() === selectedYear) {
                        fastingCounts[date.getMonth()]++
                    }
                }
            })

            // Consistency Score (Percentage of days fasted vs days passed in the year)
            const todayDate = new Date()
            const daysInYear = selectedYear === todayDate.getFullYear() ?
                Math.floor((todayDate - new Date(selectedYear, 0, 1)) / (1000 * 60 * 60 * 24)) + 1 :
                365
            const totalFasts = fastingCounts.reduce((a, b) => a + b, 0)
            const consistency = Math.round((totalFasts / daysInYear) * 100)

            // Milestones
            const milestones = []
            if (streakCount >= 7) milestones.push({ id: 'streak_7', label: '7-Day Streak', icon: '🔥' })
            if (streakCount >= 30) milestones.push({ id: 'streak_30', label: 'Ramadan Spirit', icon: '🌙' })
            if (totalFasts >= 50) milestones.push({ id: 'fasts_50', label: 'Dedicated Faster', icon: '🏆' })
            if (consistency >= 80) milestones.push({ id: 'consistency_80', label: 'Elite Focus', icon: '⭐' })

            setChartData(prev => ({
                ...prev,
                datasets: [
                    {
                        ...prev.datasets[0],
                        label: 'Fasting Days',
                        data: fastingCounts,
                        borderColor: '#10B981',
                        pointBackgroundColor: '#10B981',
                    },
                    {
                        ...prev.datasets[1]
                    },
                    {
                        ...prev.datasets[2]
                    }
                ]
            }))

            return { streakCount, consistency, milestones }

        } catch (err) {
            console.error("Error fetching fasting stats:", err)
            return { streakCount: 0, consistency: 0, milestones: [] }
        }
    }

    const fetchGroups = async () => {
        try {
            const membersRef = collection(db, 'group_members')
            const q = query(membersRef, where('user_id', '==', currentUser.uid))
            const querySnapshot = await getDocs(q)

            const groupIds = []
            querySnapshot.forEach((doc) => {
                groupIds.push(doc.data().group_id)
            })

            const groupsData = []
            const uniqueMemberIds = new Set()

            for (const groupId of groupIds) {
                const groupRef = doc(db, 'groups', groupId)
                const groupSnap = await getDoc(groupRef)

                if (groupSnap.exists()) {
                    const membersRef = collection(db, 'group_members')
                    const membersQuery = query(membersRef, where('group_id', '==', groupId))
                    const membersSnap = await getDocs(membersQuery)

                    membersSnap.forEach(doc => {
                        uniqueMemberIds.add(doc.data().user_id)
                    })

                    groupsData.push({
                        id: groupSnap.id,
                        ...groupSnap.data(),
                        member_count: membersSnap.size
                    })
                }
            }
            setGroups(groupsData)
            localStorage.setItem(`suhoor_groups_${currentUser.uid}`, JSON.stringify(groupsData))

            const totalMembers = uniqueMemberIds.size

            // Integrate Fasting Stats
            const { streakCount, consistency, milestones } = await fetchFastingStats()

            const newStats = {
                totalGroups: groupsData.length,
                totalMembers: totalMembers,
                activeToday: streakCount,
                consistency,
                milestones
            }
            setStats(newStats)
            localStorage.setItem(`suhoor_stats_${currentUser.uid}`, JSON.stringify(newStats))
        } catch (err) {
            console.error('Error fetching groups:', err)
        } finally {
            setLoading(false)
        }
    }
    return (
        <DashboardLayout>
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-gray-900 mb-1">
                            {isNewUser ? (
                                <>Welcome to <span className="text-primary">Suhoor</span>, {currentUser?.displayName || currentUser?.email?.split('@')[0]}!</>
                            ) : (
                                <>Welcome back, <span className="text-primary text-lg md:text-xl">{currentUser?.displayName || currentUser?.email?.split('@')[0]}</span></>
                            )}
                        </h1>
                        <p className="text-gray-500 font-medium">
                            May your fasts be accepted and your prayers answered.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>

                <FastingPrompt />

                {showWelcomeBanner && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 flex items-center justify-between gap-6 relative overflow-hidden group">
                            <button
                                onClick={() => setShowWelcomeBanner(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-full text-primary transition-colors z-20 cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                            <div className="relative z-10">
                                <h2 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
                                    <span className="text-2xl">✨</span> Your Journey Begins!
                                </h2>
                                <p className="text-gray-600 max-w-lg leading-relaxed">
                                    We're so glad to have you with us. Start by joining a group or exploring the rewards of fasting together. Don't forget to verify your email to access all features!
                                </p>
                            </div>
                            <div className="hidden md:flex relative z-10 p-4 bg-white rounded-2xl shadow-sm border border-primary/10 group-hover:scale-105 transition-transform">
                                <TrendingUp className="h-8 w-8 text-primary" />
                            </div>
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                )}

                <div className='flex-col-reverse md:flex-col flex'>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                        <StatsCard
                            icon={Users}
                            title="Total Groups"
                            value={stats.totalGroups}
                            subtitle="Groups joined"
                            color="blue"
                            loading={loading}
                        />
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-green-50 rounded-xl text-green-600">
                                    <Award className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    {stats.consistency}% Consistency
                                </span>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Yearly Goal</h3>
                                <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${stats.consistency}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <StatsCard
                            icon={Award}
                            title="Fasting Streak"
                            value={stats.activeToday}
                            subtitle="Consecutive Days"
                            color="purple"
                            loading={loading}
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <Users size="24" color="#2F3437" />
                                <div>
                                    <h4 className="font-medium text-[#2F3437]">Fasting History</h4>
                                    <p className="text-[#919BA1] leading-6 text-[14px]">
                                        Your fasting consistency over time
                                    </p>
                                </div>
                            </div>
                            <select
                                value={selectedYear}
                                onChange={(e) => {
                                    const year = parseInt(e.target.value)
                                    setChartLoading(true)
                                    setSelectedYear(year)
                                    setTimeout(() => setChartLoading(false), 2000)
                                }}
                                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            >
                                {[new Date().getFullYear(), 2025].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div className="h-[320px] relative">
                            {chartLoading ? (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in duration-300 rounded-xl">
                                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
                                    <p className="text-sm font-bold text-gray-500">Recalculating {selectedYear} Data...</p>
                                </div>
                            ) : null}
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>

                    {stats.milestones?.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Award className="h-4 w-4 text-primary" />
                                Spiritual Milestones
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {stats.milestones.map(m => (
                                    <div
                                        key={m.id}
                                        className="bg-white border border-gray-100 shadow-sm px-4 py-2.5 rounded-2xl flex items-center gap-3 animate-in zoom-in duration-300"
                                    >
                                        <span className="text-xl">{m.icon}</span>
                                        <span className="text-sm font-bold text-gray-700">{m.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}