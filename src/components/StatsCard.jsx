import { TrendingUp, Users, Award } from 'lucide-react'

export default function StatsCard({ icon: Icon, title, value, subtitle, color = "blue" }) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        green: "bg-green-50 text-green-600 border-green-200",
        purple: "bg-purple-50 text-purple-600 border-purple-200",
        orange: "bg-orange-50 text-orange-600 border-orange-200"
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorStyles[color]} bg-opacity-50`}>
                    <Icon className="h-6 w-6" />
                </div>
                {/* Optional: Add a small trend indicator or sparkline here later */}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{value}</h3>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {subtitle && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400">{subtitle}</p>
                </div>
            )}
        </div>
    )
}
