import { Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react';

export default function DownloadApp() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const beforeInstallHandler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        const installedHandler = () => {
            console.log('PWA installed');
            setIsVisible(false);
        };

        window.addEventListener('beforeinstallprompt', beforeInstallHandler);
        window.addEventListener('appinstalled', installedHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, []);


    const installApp = async (e) => {
        e.preventDefault();
        if (!deferredPrompt) return;

        const { outcome } = await
            deferredPrompt.prompt();

        if (outcome === 'accepted') {
            console.log('PWA installed!');
            setIsVisible(false)
        } else {
            console.log('Installation dismissed')
        }
        setDeferredPrompt(null)
    }

    if (!isVisible) return null;

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
                        Download the app, enable <span className="font-bold text-white">Smart Alarms</span>.
                        We'll wake you up, even if the app is closed, or your phone is dead.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            className="w-fit cursor-pointer sm:w-auto px-4 py-2 bg-white text-primary rounded-xl font-bold text-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 group"
                            onClick={installApp}
                        >
                            <Download className="h-6 w-6 group-hover:-translate-y-1 transition-transform" />
                            <span>Download Apk</span>
                        </button>

                        <div className="flex items-center gap-2 text-blue-100 text-sm px-4">
                            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>v1.0.0 (Direct Download)</span>
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
