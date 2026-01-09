import { TrendingUp, Users, Award } from 'lucide-react'
import SkeletonLoader from './SkeletonLoader'

export default function StatsCard({ icon: Icon, title, value, subtitle, color = "blue", loading = false }) {
    const colorStyles = {
        blue: "bg-primary/10 text-primary border-primary/20",
        green: "bg-accent/10 text-accent border-accent/20",
        purple: "bg-primary/10 text-primary border-primary/20",
        orange: "bg-secondary/10 text-secondary border-secondary/20"
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>

            {loading ? (
                <>
                    <SkeletonLoader width="w-20" height="h-8" className="mb-2" />
                    <SkeletonLoader width="w-32" height="h-4" />
                </>
            ) : (
                <>
                    <h3 className="text-3xl font-bold text-gray-900 ">{value}</h3>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                </>
            )}
        </div>
    )
}
