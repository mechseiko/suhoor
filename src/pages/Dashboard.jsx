import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Users, Award, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
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
    const { currentUser, userProfile } = useAuth();
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
        return cached ? JSON.parse(cached) : { totalGroups: 0, totalMembers: 0, totalFastingDays: 0, milestones: [] }
    })

    const [chartData, setChartData] = useState({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Fasting Days',
            data: new Array(12).fill(0),
            borderColor: '#10B981',
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
            borderColor: '#8B5CF6',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#8B5CF6',
            pointBorderColor: '#fff',
        }, {
            label: 'Groups Created',
            data: new Array(12).fill(0),
            borderColor: '#3B82F6',
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

                if (!isNaN(date.getTime()) && date.getFullYear() === selectedYear) {
                    const monthIndex = date.getMonth();
                    creationCounts[monthIndex]++;
                }
            }
        })

        const logs = await fetchActivity()
        logs.forEach(log => {
            if (log.date) {
                const date = new Date(log.date)
                if (!isNaN(date.getTime()) && date.getFullYear() === selectedYear) {
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
            checkMissedFastingPrompt()
        }
    }, [currentUser, selectedYear])

    const checkMissedFastingPrompt = async () => {
        try {
            const today = new Date();
            const todayStr = today.toLocaleDateString('en-CA');

            // Check if status for today already exists
            const statusRef = doc(db, 'daily_fasting_status', `${currentUser.uid}_${todayStr}`);
            const statusSnap = await getDoc(statusRef);

            if (!statusSnap.exists()) {
                // If not exists, check if it's 1 hour past suhoor
                const pos = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });

                const response = await fetch(
                    `https://islamicapi.com/api/v1/fasting/?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&api_key=A3A2CmTNN6m2l7pZhjCr2og3iscpW6AoFCGvOdzaiXpT3hKs`
                );
                const data = await response.json();
                const sahurTimeStr = data.data.fasting[0].time.sahur;

                const [sHours, sMinutes] = sahurTimeStr.split(':').map(Number);
                const sahurTime = new Date();
                sahurTime.setHours(sHours, sMinutes, 0, 0);

                const oneHourAfterSahur = new Date(sahurTime.getTime() + 60 * 60 * 1000);

                if (today > oneHourAfterSahur) {
                    // Default to FALSE (Not Fasting) if they missed the prompt
                    // They can manually update it if they did fast (future feature)
                    const intention = false;

                    await setDoc(statusRef, {
                        userId: currentUser.uid,
                        date: todayStr,
                        wantsToFast: intention,
                        updatedAt: serverTimestamp(),
                        isAutoDefault: true
                    });
                    console.log(`Auto-defaulted fasting status for ${todayStr} to ${intention ? 'YES' : 'NO'}`);
                }
            }
        } catch (err) {
            console.error("Error checking missed fasting prompt:", err);
        }
    }

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
            fastingLogs.sort((a, b) => new Date(b.date) - new Date(a.date))

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

            const totalFasts = fastingLogs.filter(log => log.wantsToFast).length

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

            return { fastingCounts }

        } catch (err) {
            console.error("Error fetching fasting stats:", err)
            return { fastingCounts: new Array(12).fill(0) }
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
                        const uid = doc.data().user_id
                        if (uid) {
                            uniqueMemberIds.add(uid)
                        }
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

            // Calculate total unique members across all groups
            const totalMembers = uniqueMemberIds.size

            // Integrate Fasting Stats
            const { fastingCounts } = await fetchFastingStats()

            const newStats = {
                totalGroups: groupsData.length,
                totalMembers: totalMembers,
                totalFastingDays: fastingCounts.reduce((a, b) => a + b, 0)
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

                {showWelcomeBanner && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6 flex items-center justify-between gap-6 relative overflow-hidden group">
                            <button
                                onClick={() => setShowWelcomeBanner(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-full text-primary transition-colors z-20 cursor-pointer"
                            >
                                <X size={20} title="Close Welcome modal" onClick={() => window.location.href = '/dashboard'} />
                            </button>
                            <div className="relative z-10">
                                <h2 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
                                    <span className="text-xl">✨</span> Your Journey Begins!
                                </h2>
                                <p className="text-gray-600 max-w-lg leading-relaxed">
                                    {currentUser?.displayName ? `${currentUser?.displayName}, w` : 'W'}e're so glad to have you with us. You can start by <Link to='/groups?from=create' className='underline text-primary'>creating a group</Link> or reading <Link to='/books' className='underline text-primary'>books of knowledge</Link>
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                )}

                <FastingPrompt />

                <div className='flex-col-reverse md:flex-col flex mt-10'>
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
                            icon={Users}
                            title="Total Members"
                            value={stats.totalMembers}
                            subtitle="Across all groups"
                            color="green"
                            loading={loading}
                        />
                        <StatsCard
                            icon={Award}
                            title="Fasting Days"
                            value={stats.totalFastingDays || 0}
                            subtitle="This year"
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
                                {[new Date().getFullYear()].map(year => (
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
                </div>
            </div>
        </DashboardLayout>
    )
}