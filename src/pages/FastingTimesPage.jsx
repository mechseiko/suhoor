import FastingTimes from '../components/FastingTimes'
import DashboardLayout from '../layouts/DashboardLayout'

export default function FastingTimesPage() {
    return (
        <DashboardLayout>
            <div className="mx-auto space-y-6">
                <FastingTimes />
            </div>
        </DashboardLayout>
    )
}
