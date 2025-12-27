import { Star, Quote } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Testimonials() {
    const [current, setCurrent] = useState(0)

    const testimonials = [
        {
            name: "Abdulqoyum Amuda",
            role: "Developer",
            text: "Simple, effective, and exactly what is needed for any community group.",
            rating: 5
        }
    ]

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % testimonials.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="py-16 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        What People Say
                    </h2>
                </div>

                <div className="relative">
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
                        <Quote className="h-10 w-10 text-primary mb-6 opacity-50" />

                        <div className="mb-6">
                            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                                "{testimonials[current].text}"
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900">{testimonials[current].name}</p>
                                <p className="text-sm text-gray-600">{testimonials[current].role}</p>
                            </div>

                            <div className="flex gap-1">
                                {[...Array(testimonials[current].rating)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-2 mt-6">
                        {testimonials.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`h-2 rounded-full transition-all ${current === idx ? 'w-8 bg-primary' : 'w-2 bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
