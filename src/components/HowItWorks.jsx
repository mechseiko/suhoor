import { Clock, Users, Bell, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import SectionHeader from './SectionHeader'

export default function HowItWorks() {
    const [activeStep, setActiveStep] = useState()
        useEffect(() => {
            const handleScroll = () => {
                const section = document.getElementById("features");
                if (!section || window.innerWidth > 768) return;
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top;
                const sectionHeight = rect.height;
                const windowHeight = window.innerHeight;
                const eachBoxHeight = sectionHeight/4 + 150
                if (sectionTop < windowHeight && sectionTop + sectionHeight > 0) {
                    const visibleTop = Math.max(0, windowHeight - sectionTop);
                    if(visibleTop < eachBoxHeight) {
                        setActiveStep(0)
                    }
                    if(visibleTop > eachBoxHeight && visibleTop < (2 * eachBoxHeight)) {
                        setActiveStep(1)
                    }
                    if(visibleTop > (2 * eachBoxHeight)  && visibleTop < (3 * eachBoxHeight)) {
                        setActiveStep(2)
                    }
                    if(visibleTop > (3 * eachBoxHeight)  && visibleTop < (4 * eachBoxHeight)) {
                        setActiveStep(3)
                    }
                }
                };
            window.addEventListener("scroll", handleScroll);
            handleScroll();
            return () => window.removeEventListener("scroll", handleScroll);
        }, []);

    const steps = [
        {
            icon: Users,
            title: "Create Your Group",
            desc: "Start a group or join one with friends and family",
            color: "blue"
        },
        {
            icon: Clock,
            title: "Wake Times",
            desc: "Everyone gets notified when it's time for Suhoor",
            color: "green"
        },
        {
            icon: Bell,
            title: "Stay Connected",
            desc: "See who's awake and wake those that are not",
            color: "purple"
        },
        {
            icon: CheckCircle,
            title: "Track Progress",
            desc: "Monitor your group's consistency",
            color: "orange"
        }
    ]

    return (
        <div className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <SectionHeader
                    title="How It Works"
                    subtitle="Get started in minutes and you'll never miss Suhoor again. If Allah wishes."
                />
                <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, idx) => {
                        const Icon = step.icon
                        const isActive = window.innerWidth < 768 ? activeStep === idx : false

                        return (
                            <div
                                key={idx}
                                className={`p-6 rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-primary text-white shadow-xl scale-105'
                                    : 'bg-white text-gray-900 shadow-sm hover:shadow-xl'
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