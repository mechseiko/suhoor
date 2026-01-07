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
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <Quote className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inspiration Box</span>
                    </div>
                    <button
                        onClick={getNewQuote}
                        className={`p-2 hover:bg-gray-50 rounded-full transition-all duration-300 ${isAnimating ? 'rotate-180' : ''}`}
                        title="New Quote"
                    >
                        <RefreshCw className="h-4 w-4 text-gray-400" />
                    </button>
                </div>

                <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                    <p className="text-lg md:text-xl font-serif text-gray-800 leading-relaxed italic mb-4">
                        "{quote.text}"
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="h-px w-8 bg-primary/20"></div>
                        <p className="text-sm text-primary font-bold">
                            {quote.source}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
