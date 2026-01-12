import { motion } from 'framer-motion'
import { Smartphone, Monitor } from 'lucide-react'
import suhoorLive from '../../public/suhoor-live.mp4'

export default function AppShowcase() {
    return (
        <section className="py-24 max-w-6xl mx-auto bg-white rounded-lg overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-12 lg:mb-0"
                    >
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-primary font-medium text-sm mb-6 border border-blue-100">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                            Seamless Synchronization
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            One Account,<br />
                            <span className="text-primary">Any Device</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Whether you're on your laptop or on your phone checking Suhoor times in bed, your experience is perfectly synced.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <Monitor className="h-6 w-6 text-gray-700" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Web Dashboard</h3>
                                    <p className="text-gray-600">Manage groups, view detailed stats, and access the full library of resources from your desktop.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <Smartphone className="h-6 w-6 text-gray-700" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Mobile App</h3>
                                    <p className="text-gray-600">Get reliable wakeup alarms, real time Buzz notifications, and location based prayer times on the go.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative rounded-3xl bg-gray-900 p-2 shadow-2xl border-4 border-gray-800 aspect-video flex items-center justify-center overflow-hidden">
                                <div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center text-center p-8">
                                        <video
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            className="rounded-md w-full z-10"
                                        >
                                            <source src={suhoorLive} type="video/mp4" />
                                            Your browser does not support video
                                        </video>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
