import { Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { Capacitor } from '@capacitor/core'
import { useNative } from '../hooks/useNative'
import { useState, useEffect } from 'react'

export default function DownloadApp() {
    const isNative = useNative()
    const isCapacitor = Capacitor.isNativePlatform()
    const [isMobile, setIsMobile] = useState(false)

    const [isDownloading, setIsDownloading] = useState(false)

    useEffect(() => {
        setIsMobile(window.innerWidth < 768)
    }, [])

    const handleDownload = () => {
        setIsDownloading(true)
        setTimeout(() => {
            setIsDownloading(false)
        }, 3000)
    }

    // Only show on Mobile Web (Not Capacitor, Not Standalone/PWA)
    if (isCapacitor || isNative || !isMobile) return null

    return (
        <section className="bg-gradient-to-r from-primary to-primary/90 rounded-lg md:py-18 py-16 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pattern-dots"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Download the App
                    </h2>
                    <p className="text-lg text-blue-100 mb-10 leading-relaxed">
                        Download the Suhoor app for Android to enable <span className="font-bold text-white">Smart Alarms</span>.
                        We'll wake you up, even if the app is closed, or your phone is dead.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href={isDownloading ? '#' : '/suhoor.apk'}
                            onClick={handleDownload}
                            download={!isDownloading && "Suhoor.apk"}
                            className={`w-fit sm:w-auto px-6 py-3 bg-white text-primary rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 group ${isDownloading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:shadow-xl hover:bg-gray-50'}`}
                        >
                            <Download className={`h-6 w-6 ${isDownloading ? 'animate-bounce' : 'group-hover:-translate-y-1 transition-transform'}`} />
                            <span>{isDownloading ? 'Downloading...' : 'Download APK'}</span>
                        </a>

                        <div className="flex items-center gap-2 text-blue-100 text-sm px-4">
                            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>v1.0.0 (Latest Build)</span>
                        </div>
                    </div>

                    <p className="mt-8 text-sm text-blue-200/80">
                        *Requires Android 8.0 or higher. Installation instructions included.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
