import { useState, useEffect } from 'react'
import { Users, TrendingUp, Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { doc, getDoc, setDoc, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore'
import StatsCard from '../components/StatsCard'
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

    const [groups, setGroups] = useState(() => {
        const cached = localStorage.getItem(`suhoor_groups_${currentUser?.uid}`)
        return cached ? JSON.parse(cached) : []
    })
    const [loading, setLoading] = useState(!groups.length)
    const [stats, setStats] = useState(() => {
        const cached = localStorage.getItem(`suhoor_stats_${currentUser?.uid}`)
        return cached ? JSON.parse(cached) : { totalGroups: 0, totalMembers: 0, activeToday: 0 }
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
    }, [currentUser])

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
            const today = new Date().toISOString().split('T')[0]
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

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
                const dateStr = currentCheckDate.toISOString().split('T')[0]
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
                    if (!isNaN(date.getTime())) {
                        fastingCounts[date.getMonth()]++
                    }
                }
            })

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

            return streakCount

        } catch (err) {
            console.error("Error fetching fasting stats:", err)
            return 0
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
            for (const groupId of groupIds) {
                const groupRef = doc(db, 'groups', groupId)
                const groupSnap = await getDoc(groupRef)
                if (groupSnap.exists()) {
                    const membersRef = collection(db, 'group_members')
                    const memberCountQuery = query(membersRef, where('group_id', '==', groupId))
                    const memberCountSnap = await getCountFromServer(memberCountQuery)

                    groupsData.push({
                        id: groupSnap.id,
                        ...groupSnap.data(),
                        member_count: memberCountSnap.data().count
                    })
                }
            }
            setGroups(groupsData)
            localStorage.setItem(`suhoor_groups_${currentUser.uid}`, JSON.stringify(groupsData))

            const totalMembers = groupsData.reduce((sum, group) => sum + (group.member_count || 0), 0)

            // Integrate Fasting Stats
            const streak = await fetchFastingStats()

            const newStats = {
                totalGroups: groupsData.length,
                totalMembers: totalMembers,
                activeToday: streak // Re-purposing this field name or mapping it in UI
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
                            Welcome back, <span className="text-primary text-lg md:text-xl">{currentUser?.displayName || currentUser?.email?.split('@')[0]}</span>
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
                        <StatsCard
                            icon={TrendingUp}
                            title="Total Members"
                            value={stats.totalMembers}
                            subtitle="Across all groups"
                            color="green"
                            loading={loading}
                        />
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
                        <div className="flex items-center space-x-2 mb-4">
                            <Users size="24" color="#2F3437" />
                            <div>
                                <h4 className="font-medium text-[#2F3437]">Fasting History</h4>
                                <p className="text-[#919BA1] leading-6 text-[14px]">
                                    Your fasting consistency over the year
                                </p>
                            </div>
                        </div>

                        <div className="h-[320px]">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}