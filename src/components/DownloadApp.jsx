import { Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNative } from '../hooks/useNative'
import { useState, useEffect } from 'react'

export default function DownloadApp() {
    const isNative = useNative()
    const [isMobile, setIsMobile] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [canInstall, setCanInstall] = useState(false)

    useEffect(() => {
        setIsMobile(window.innerWidth < 768)
        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setCanInstall(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        if (window.matchMedia('(display-mode: standalone)').matches) {
            setCanInstall(false)
        }

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()

        const { outcome } = await deferredPrompt.userChoice
        console.log(`User response to the install prompt: ${outcome}`)

        setDeferredPrompt(null)
        setCanInstall(false)
    }

    // if (isNative || !isMobile) return null

    return (
        <section className="bg-gradient-to-r from-primary to-primary/90 rounded-lg md:py-14 py-10 relative overflow-hidden">
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
                        {canInstall ? 'Install Suhoor App' : 'Get Suhoor for Mobile'}
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://github.com/mechseiko/suhoor/releases/latest/download/Suhoor.apk"
                            className="w-fit sm:w-auto px-6 py-2 bg-white text-primary rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 group cursor-pointer hover:shadow-xl hover:bg-gray-50"
                        >
                            <Download className="md:h-5 md:w-5 h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                            <span>Download APK</span>
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
