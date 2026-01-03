import { useState, useEffect } from 'react'
import { Quote, RefreshCw } from 'lucide-react'

const quotes = [
    {
        text: "Fasting is a shield with which a servant protects himself from the Fire.",
        source: "Sunan an-Nasa'i 2231"
    },
    {
        text: "Whoever fasts Ramadan out of faith and hope for reward, his past sins will be forgiven.",
        source: "Sahih al-Bukhari 38"
    },
    {
        text: "When Ramadan enters, the gates of Paradise are opened, the gates of Hellfire are closed and the devils are chained.",
        source: "Sahih al-Bukhari 1899"
    },
    {
        text: "The best charity is that given in Ramadan.",
        source: "Jami` at-Tirmidhi 663"
    },
    {
        text: "Eat suhoor, for in suhoor there is blessing.",
        source: "Sahih al-Bukhari 1923"
    },
    {
        text: "He is not a believer whose stomach is filled while the neighbor to his side goes hungry.",
        source: "Al-Adab Al-Mufrad 112"
    },
    {
        text: "Do not lose hope, nor be sad.",
        source: "Quran 3:139"
    },
    {
        text: "Indeed, with hardship [will be] ease.",
        source: "Quran 94:6"
    }
]

export default function DailyQuote() {
    const [quote, setQuote] = useState(quotes[0])
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
        setQuote(quotes[dayOfYear % quotes.length])
    }, [])

    const getNewQuote = () => {
        setIsAnimating(true)
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * quotes.length)
            setQuote(quotes[randomIndex])
            setIsAnimating(false)
        }, 300)
    }

    return (
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-24 w-24 bg-accent opacity-20 rounded-full blur-xl"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Quote className="h-4 w-4 text-white/80" />
                        <span className="text-white/90 text-sm font-medium uppercase tracking-wider">Knowledge Box</span>
                    </div>
                    <button
                        onClick={getNewQuote}
                        className={`p-2 hover:bg-white/10 rounded-full transition-all duration-300 ${isAnimating ? 'rotate-180' : ''}`}
                        title="New Quote"
                    >
                        <RefreshCw className="h-4 w-4 text-white/90" />
                    </button>
                </div>

                <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    <p className="text-lg md:text-xl font-serif leading-relaxed mb-3">
                        "{quote.text}"
                    </p>
                    <p className="text-sm text-white/80 font-medium">
                        — {quote.source}
                    </p>
                </div>
            </div>
        </div>
    )
}
