import { Clock, Users, Bell, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import SectionHeader from './SectionHeader'

export default function HowItWorks() {
    const [activeStep, setActiveStep] = useState(0)

    const steps = [
        {
            icon: Users,
            title: "Create Your Group",
            desc: "Start a group or join one with friends and family",
            color: "blue"
        },
        {
            icon: Clock,
            title: "Set Wake Times",
            desc: "Everyone gets notified when it's time for Suhoor",
            color: "green"
        },
        {
            icon: Bell,
            title: "Stay Connected",
            desc: "See who's awake and keep each other motivated",
            color: "purple"
        },
        {
            icon: CheckCircle,
            title: "Track Progress",
            desc: "Monitor your group's consistency throughout Ramadan",
            color: "orange"
        }
    ]

    return (
        <div className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <SectionHeader
                    title="How It Works"
                    subtitle="Get started in minutes and never miss Suhoor again"
                />

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, idx) => {
                        const Icon = step.icon
                        const isActive = activeStep === idx

                        return (
                            <div
                                key={idx}
                                onMouseEnter={() => setActiveStep(idx)}
                                onMouseLeave={() => setActiveStep()}
                                className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${isActive
                                    ? 'bg-primary text-white shadow-xl scale-105'
                                    : 'bg-white text-gray-900 shadow-sm hover:shadow-md'
                                    }`}
                            >
                                <div className={`inline-flex p-3 rounded-lg mb-4 ${isActive ? 'bg-white/20' : 'bg-primary/10'
                                    }`}>
                                    <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-primary'}`} />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-sm font-semibold ${isActive ? 'text-white/80' : 'text-primary'
                                        }`}>
                                        Step {idx + 1}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                                <p className={`text-sm ${isActive ? 'text-white/90' : 'text-gray-600'}`}>
                                    {step.desc}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
