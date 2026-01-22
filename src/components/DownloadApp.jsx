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
        }, 5000)
    }

    // Only show on Mobile Web (Not Capacitor, Not Standalone/PWA)
    if (isCapacitor || isNative || !isMobile) return null

    return (
        <section className="bg-gradient-to-r from-primary to-primary/90 rounded-lg md:py-14 py-10 relative overflow-hidden">
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

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href='/Suhoor.apk'
                            onClick={handleDownload}
                            download="Suhoor.apk"
                            className={`w-fit sm:w-auto px-6 py-2 bg-white text-primary rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 group ${isDownloading ? 'opacity-50' : 'cursor-pointer hover:shadow-xl hover:bg-gray-50'}`}
                        >
                            <Download className={`h-6 w-6 ${isDownloading ? 'animate-bounce' : 'group-hover:-translate-y-1 transition-transform'}`} />
                            <span>{isDownloading ? 'Downloading...' : 'Download APK'}</span>
                        </a>

                        <a
                            href="/docs?section=mobile-setup"
                            className="text-white/80 hover:text-white text-sm font-medium underline flex items-center gap-2 transition-colors"
                        >
                            How to install?
                        </a>

                        <div className="flex items-center gap-2 text-blue-100 text-sm px-4">
                            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>v1.0.0</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
