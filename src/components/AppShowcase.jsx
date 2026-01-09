import { motion } from 'framer-motion'
import { Smartphone, Monitor } from 'lucide-react'
import { useState } from 'react'

export default function AppShowcase() {
    const [playVideo, setPlayVideo] = useState(false);
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
                                {!playVideo ?
                                    <div>
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center text-center p-8">
                                            <div onClick={() => setPlayVideo(true)} className="w-16 cursor-pointer h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                                            </div>
                                            <p className="text-white font-medium tracking-wide upppercase text-sm">Watch the Demo</p>
                                            <p className="text-gray-500 text-xs mt-2">Web & Mobile Sync in Action</p>
                                        </div>

                                        {/* Decorative Elements */}
                                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                                    </div>

                                    :
                                    <div className='text-white'>
                                        Video in play
                                    </div>
                                }
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
