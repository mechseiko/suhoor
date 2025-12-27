import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
    {
        question: "Is Suhoor completely free to use?",
        answer: "Yes! Suhoor is 100% free for all individuals and groups. Our mission is to help everyone track their fasts and stay connected during Ramadan and beyond."
    },
    {
        question: "How do the groups work?",
        answer: "You can create a group and invite friends or family using a unique code. Once they join, you can see each other's progress on a shared leaderboard, motivating everyone to keep up with their goals."
    },
    {
        question: "Can I track missed fasts?",
        answer: "Absolutely. You can log missed fasts and mark them as 'made up' later. We help you keep a precise count so you never lose track of your obligations."
    },
    {
        question: "Is there a mobile app?",
        answer: "Suhoor is a Progressive Web App (PWA). This means you can install it directly from your browser to your home screen, and it works just like a native app on both iOS and Android."
    },
    {
        question: "How accurate are the prayer times?",
        answer: "We use high-precision calculation methods based on your location. You can also adjust the calculation method (e.g., ISNA, MWL) in your settings to match your local mosque."
    }
]

export default function Faq() {
    const [openIndex, setOpenIndex] = useState(null)

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-xl text-gray-600">
                        Everything you need to know about Suhoor
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-lg font-semibold text-gray-900">
                                    {faq.question}
                                </span>
                                {openIndex === idx ? (
                                    <ChevronUp className="w-5 h-5 text-primary" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
