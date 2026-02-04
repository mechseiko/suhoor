import { useState, useEffect } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { Calendar } from 'lucide-react'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

export default function GroupAnalytics({ groupId, memberCount }) {
    const [loading, setLoading] = useState(true)
    const [chartData, setChartData] = useState(null)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const today = new Date()
                const last7Days = []
                for (let i = 6; i >= 0; i--) {
                    const d = new Date()
                    d.setDate(today.getDate() - i)
                    last7Days.push(d.toLocaleDateString('en-CA'))
                }

                const logsRef = collection(db, 'wake_up_logs')
                const q = query(
                    logsRef,
                    where('group_id', '==', groupId),
                    where('date', 'in', last7Days)
                )
                const querySnapshot = await getDocs(q)

                const stats = {}
                last7Days.forEach(date => stats[date] = 0)

                querySnapshot.forEach(doc => {
                    const data = doc.data()
                    if (stats[data.date] !== undefined) {
                        stats[data.date]++
                    }
                })

                const labels = last7Days.map(date => {
                    const d = new Date(date)
                    return d.toLocaleDateString('en-US', { weekday: 'short' })
                })

                const data = {
                    labels,
                    datasets: [
                        {
                            label: 'Members Awake',
                            data: last7Days.map(date => stats[date]),
                            backgroundColor: 'rgba(59, 130, 246, 0.6)',
                            borderColor: 'rgb(59, 130, 246)',
                            borderWidth: 1,
                            borderRadius: 6,
                        },
                    ],
                }

                setChartData(data)
            } catch (err) {
                console.error('Error fetching analytics:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [groupId])

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.raw} / ${memberCount} members awake`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: memberCount || 10,
                ticks: {
                    stepSize: 10
                },
                grid: {
                    display: false
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
    }

    if (loading) return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-[300px] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-48 w-64 bg-gray-100 rounded-lg mb-4"></div>
                <div className="h-4 w-32 bg-gray-100 rounded"></div>
            </div>
        </div>
    )

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">
                        Wake Up Stats
                    </h3>
                    <p className="text-sm text-gray-500">Activity for the last seven days</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-400" />
                </div>
            </div>

            <div className="h-[200px] w-full">
                {chartData && <Bar data={chartData} options={options} />}
            </div>
        </div>
    )
}
