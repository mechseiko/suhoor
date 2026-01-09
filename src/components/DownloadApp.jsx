import { Download } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DownloadApp() {
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
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Never Miss Suhoor Again
                    </h2>
                    <p className="md:text-xl text-lg text-blue-100 mb-10 leading-relaxed">
                        Download the official Android app to enable <span className="font-bold text-white">Smart Alarms</span>.
                        We'll wake you up 15 minutes before Suhoor, even if your phone is on silent or the app is closed.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            className="w-full cursor-pointer sm:w-auto px-6 py-3 bg-white text-primary rounded-xl font-bold text-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 group"
                            onClick={() => alert('Download Started')}
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
