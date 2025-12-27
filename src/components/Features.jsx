import { Users, Bell, Calendar, Moon } from 'lucide-react'
import FeatureCard from './FeatureCard'

export default function Features() {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <FeatureCard
                icon={<Users className="h-12 w-12 text-primary" />}
                title="Create Groups"
                description="Start a group or join existing ones with friends and family using a shared group key."
            />
            <FeatureCard
                icon={<Bell className="h-12 w-12 text-primary" />}
                title="Wake Up Alerts"
                description="Get notified when it's time for Suhoor and see who's awake in your group."
            />
            <FeatureCard
                icon={<Calendar className="h-12 w-12 text-primary" />}
                title="Fasting Times"
                description="View accurate Suhoor and Iftar times with Hijri dates and white days information."
            />
            <FeatureCard
                icon={<Moon className="h-12 w-12 text-primary" />}
                title="Track Together"
                description="Keep everyone accountable and motivated throughout the blessed month."
            />
        </div>
    )
}
