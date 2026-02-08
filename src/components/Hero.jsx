import { useState, useEffect, useRef } from 'react'
import LanderCta from './LanderCta'

export default function Hero({ navigate }) {
    const [text, setText] = useState("with friends")
    const indexRef = useRef(0)
    const keys = ["with friends", "in groups", "with family"]

    useEffect(() => {
        const textInterval = setInterval(() => {
            indexRef.current = (indexRef.current + 1) % keys.length
            setText(keys[indexRef.current])
        }, 3000)

        return () => clearInterval(textInterval)
    }, [])

    return (
        <div className="text-center max-w-4xl mx-auto mb-12 pt-22 md:pt-26">
            <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight px-4">
                Wake Up for <span className='text-primary'>Suhoor {text}</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed px-4 max-w-2xl mx-auto">
              Create groups, connect with loved ones, ensure everyone wakes up on time for suhoor and start your fast with blessings and unity.
            </p>
            <LanderCta 
                className1="w-full group flex items-center justify-center gap-2 sm:w-auto px-6 py-2.5 bg-primary text-white text-base rounded-lg hover:opacity-90 font-medium transition shadow-lg hover:shadow-xl"
                className2="w-full sm:w-auto px-6 py-2.5 bg-white border-2 border-primary text-primary text-base rounded-lg hover:bg-primary/10 font-medium transition"
            />
        </div>
    )
}
