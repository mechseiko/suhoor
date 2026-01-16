import { useState, useEffect } from 'react'
import {
    Users,
    Layers,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Search,
    Globe
} from 'lucide-react'
import { db } from '../config/firebase'
import { collection, query, getDocs, getCountFromServer, orderBy, limit, where } from 'firebase/firestore'
import DashboardLayout from '../layouts/DashboardLayout'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

export default function AdminAnalytics() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalGroups: 0,
        totalWakeUps: 0,
        activeGroups: 0
    })
    const [chartData, setChartData] = useState(null)
    const [recentActivity, setRecentActivity] = useState([])

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                // Fetch Total Counts
                const usersCount = await getCountFromServer(collection(db, 'profiles'))
                const groupsCount = await getCountFromServer(collection(db, 'groups'))
                const logsCount = await getCountFromServer(collection(db, 'wake_up_logs'))

                // For Active Groups, let's assume groups with activity in the last 7 days
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                const activeGroupsQuery = query(
                    collection(db, 'groups'),
                    where('last_activity', '>=', weekAgo.toISOString().split('T')[0])
                )
                const activeGroupsCount = await getCountFromServer(activeGroupsQuery)

                setStats({
                    totalUsers: usersCount.data().count,
                    totalGroups: groupsCount.data().count,
                    totalWakeUps: logsCount.data().count,
                    activeGroups: activeGroupsCount.data().count
                })

                // Fetch Growth Trends (Users per Month for current year)
                const currentYear = new Date().getFullYear()
                const usersSnap = await getDocs(query(collection(db, 'profiles'), orderBy('created_at', 'asc')))

                const monthlyGrowth = new Array(12).fill(0)
                usersSnap.forEach(doc => {
                    const data = doc.data()
                    if (data.created_at) {
                        const date = new Date(data.created_at)
                        if (date.getFullYear() === currentYear) {
                            monthlyGrowth[date.getMonth()]++
                        }
                    }
                })

                // Cumulative Growth
                let cumulative = 0
                const cumulativeData = monthlyGrowth.map(count => {
                    cumulative += count
                    return cumulative
                })

                setChartData({
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                        {
                            label: 'Total Users (Cumulative)',
                            data: cumulativeData,
                            fill: true,
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderColor: 'rgb(59, 130, 246)',
                            tension: 0.4,
                            pointRadius: 4,
                            pointBackgroundColor: 'rgb(59, 130, 246)',
                        }
                    ]
                })

            } catch (err) {
                console.error("Error fetching admin stats:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchAdminStats()
    }, [])

    const adminOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                padding: 12,
                backgroundColor: '#1e293b',
                titleColor: '#94a3b8',
                bodyColor: '#f8fafc',
                bodyFont: { weight: 'bold' }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f1f5f9' },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                border: { display: false }
            }
        }
    }

    const StatBox = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-3xl font-black text-gray-900 mt-1">{value?.toLocaleString()}</p>
        </div>
    )

    return (
        <DashboardLayout pageTitle="Admin Insights">
            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatBox title="Total Members" value={stats.totalUsers} icon={Users} color="blue" />
                    <StatBox title="Total Groups" value={stats.totalGroups} icon={Layers} color="indigo" />
                    <StatBox title="Total Wake Ups" value={stats.totalWakeUps} icon={TrendingUp} color="emerald" />
                    <StatBox title="Active Groups" value={stats.activeGroups} icon={Globe} color="amber" />
                </div>

                {/* Growth Chart */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">User Growth</h2>
                            <p className="text-sm text-gray-500">Cumulative member registration trajectory</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                            <button className="px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-lg shadow-sm">Yearly</button>
                            <button className="px-4 py-2 text-gray-400 text-xs font-bold rounded-lg">All Time</button>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        {chartData ? (
                            <Line data={chartData} options={adminOptions} />
                        ) : (
                            <div className="h-full flex items-center justify-center animate-pulse bg-gray-50 rounded-2xl">
                                <Search className="h-8 w-8 text-gray-300 mr-2" />
                                <span className="text-gray-400 font-medium">Crunching Global Data...</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                        <div className="space-y-4">
                            {recentActivity.length > 0 ? recentActivity.map(act => (
                                <div key={act.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 transition-colors hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                            {act.type === 'wake_up' ? '🌅' : '👤'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{act.label}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(act.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase px-2 py-1 bg-gray-100/50 rounded-lg">
                                        {act.type === 'wake_up' ? 'WakeUp.Log' : 'System.Auth'}
                                    </span>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-400 italic">No recent activity detected.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
