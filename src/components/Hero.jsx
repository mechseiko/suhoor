import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Hero({ navigate }) {
    const { currentUser } = useAuth()
    const [text, setText] = useState("In groups")
    const indexRef = useRef(0)
    const keys = ["in groups", "with friends", "with family"]

    useEffect(() => {
        const textInterval = setInterval(() => {
            indexRef.current = (indexRef.current + 1) % keys.length
            setText(keys[indexRef.current])
        }, 3000)

        return () => clearInterval(textInterval)
    }, [])

    return (
        <div className="text-center max-w-4xl mx-auto mb-12 pt-20 md:pt-24">
            <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight px-4">
                Wake Up for <span className='text-primary'>Suhoor {text}</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed px-4 max-w-2xl mx-auto">
              Connect with loved ones, ensure everyone wakes up on time, and start your fast with blessings and unity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                <button
                    onClick={() => navigate(currentUser ? '/dashboard' : '/signup')}
                    className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white text-base rounded-lg hover:opacity-90 font-medium transition shadow-lg hover:shadow-xl"
                >
                    {currentUser ? "Go to Dashboard" : "Get Started"}
                </button>
                <button
                    onClick={() => navigate('/books')}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white border-2 border-primary text-primary text-base rounded-lg hover:bg-primary/10 font-medium transition"
                >
                    Learn More
                </button>
            </div>
        </div>
    )
}
