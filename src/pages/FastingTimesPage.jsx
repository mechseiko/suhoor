import FastingTimes from '../components/FastingTimes'
import HydrationTracker from '../components/HydrationTracker'
import MissedFastsTracker from '../components/MissedFastsTracker'
import ProTip from '../components/ProTip'
import DashboardLayout from '../layouts/DashboardLayout'

export default function FastingTimesPage() {
    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <FastingTimes />
                    <MissedFastsTracker />
                </div>
                <div className="space-y-6">
                    <HydrationTracker />
                    <ProTip />
                </div>
            </div>
        </DashboardLayout>
    )
}
