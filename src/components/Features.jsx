import { Users, Bell, Calendar, BookOpen } from 'lucide-react'
import FeatureCard from './FeatureCard'
import SectionHeader from './SectionHeader'

export default function Features() {
    return (
            <div className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="col-span-full">
                        <SectionHeader
                            title="Everything Suhoor. In one App"
                            subtitle="Designed to help you make the most of your fasting period"
                        />
                </div>
                <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
                    <FeatureCard
                        icon={<Users className="h-10 w-10 text-primary" />}
                        title="Community Circles"
                        description="Form spiritual circles with friends and family. Share the blessings of Suhoor through a unified platform."
                    />
                    <FeatureCard
                        icon={<Bell className="h-10 w-10 text-primary" />}
                        title="Wake Up Calls"
                        description="Ensure no one misses the meal. Send and receive real time notifications to wake your group members."
                    />
                    <FeatureCard
                        icon={<Calendar className="h-10 w-10 text-primary" />}
                        title="Fasting Times"
                        description="Accurate timings for Suhoor and Iftar, complete with Hijri dates and Sunnah fasting reminders."
                    />
                    <FeatureCard
                        icon={<BookOpen className="h-10 w-10 text-primary" />}
                        title="Resources"
                        description="Explore a curated collection of essential Islamic duas and books on fasting."
                    />
                </div>
            </div>
        </div>
    )
}
