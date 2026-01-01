import { Users, Bell, Calendar, Moon } from 'lucide-react'
import FeatureCard from './FeatureCard'
import SectionHeader from './SectionHeader'

export default function Features() {
    return (
                <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
            <div className="col-span-full">
                <SectionHeader
                    title="Everything You Need"
                    subtitle="Designed to help you make the most of your fasting period"
                />
            </div>
            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
                <FeatureCard
                    icon={<Users className="h-12 w-12 text-primary" />}
                    title="Community Circles"
                    description="Form spiritual circles with friends and family. Share the blessings of Suhoor through a unified platform."
                />
                <FeatureCard
                    icon={<Bell className="h-12 w-12 text-primary" />}
                    title="Wake Up Calls"
                    description="Ensure no one misses the blessed meal. Send and receive real-time notifications to wake your circle."
                />
                <FeatureCard
                    icon={<Calendar className="h-12 w-12 text-primary" />}
                    title="Prayer & Iftar"
                    description="Accurate timings for Suhoor and Iftar, complete with Hijri dates and Sunnah fasting reminders."
                />
                <FeatureCard
                    icon={<Moon className="h-12 w-12 text-primary" />}
                    title="Collective Consistency"
                    description="Motivate one another to maintain consistency in worship and fasting."
                />
            </div>
        </div>
        </div>
    )
}
