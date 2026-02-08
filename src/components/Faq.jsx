import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import SectionHeader from './SectionHeader'

const faqs = [
    {
        question: "Is Suhoor completely free to use?",
        answer: "Yes! Suhoor is 100% free for all. Our mission is to help everyone eat suhoor, track their fasts and stay connected."
    },
    {
        question: "How do the groups work?",
        answer: "You can join or create a group and invite friends or family using a unique code. Once they join, you can wake each other up for suhoor."
    },
    {
        question: "Is there a mobile app?",
        answer: "Absolutely! There is a mobile app. This means you can install it directly to your home screen, and it works on both iOS and Android devices."
    },
    {
        question: "How accurate are the fasting times?",
        answer: "We use high precision calculation methods based on your location. You can also adjust the calculation method in your settings to match your local mosque."
    },
    {
        question: "Is my location data private?",
        answer: "Your location is ONLY shared within your selected group and ONLY during the 30 minute wake up window. We never track you outside of these times."
    },
    {
        question: "Can I use Suhoor for voluntary fasts?",
        answer: "Of course! Suhoor is designed to be used year round for Sunnah fasts (like Mondays and Thursdays) or any other voluntary fasting."
    }
]

export default function Faq() {
    const [openIndex, setOpenIndex] = useState(null)

    return (
        <section className="py-24 bg-gray-50">
            <div className="container mx-auto px-6 max-w-4xl">
                <SectionHeader
                    title="Frequently Asked Questions"
                    subtitle="Everything you need to know about starting your journey with Suhoor."
                />

                <div className="space-y-4">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIndex === idx
                        return (
                            <div
                                key={idx}
                                className={`bg-white rounded-2xl transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-md ${isOpen ? 'shadow-md' : ''}`}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                                    className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                                >
                                    <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-primary' : 'text-gray-900'}`}>
                                        {faq.question}
                                    </span>
                                    <div className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    </div>
                                </button>

                                <div
                                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                        }`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
