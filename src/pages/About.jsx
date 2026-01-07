import { Moon, Heart, Users, Bell, Globe, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'

export default function About() {
    const { currentUser } = useAuth()

    return(
         <div className="max-w-7xl mx-auto md:pt-15 pt-12 pb-8 px-4 mt-5">
            <div>
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">
                        <Moon className="h-8 w-8 text-primary" />
                    </div>
                    <SectionHeader
                    title="Waking the Ummah for Suhoor"
                    subtitle="Suhoor is more than just an app, it's a spiritual companion designed to ensure you never miss the blessed meal. Connect with loved ones, wake each other up, and share the blessings of Fasting."
                    />
                </div>

                {!currentUser && (
                    <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl hover:bg-blue-600 transition-all font-semibold shadow-lg shadow-blue-200">
                        Start Your Journey
                    </Link>
                )}
            </div>

            <div className="bg-white py-20 border-y border-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                            <p className="text-gray-600 leading-loose">
                                We realized that waking up for Suhoor alone can be difficult, and traditional alarms are easy to snooze. Suhoor (the app) revives the Sunnah of communal waking, allowing groups of friends and families to hold each other accountable.
                            </p>
                            <p className="text-gray-600 leading-loose">
                                Our goal is to leverage technology to strengthen spiritual bonds, ensuring that every Muslim can maximize the blessings of their fasting days starting with a nourishing Suhoor.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <div className="flex flex-col gap-2 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <Users className="h-6 w-6 text-primary" />
                                    <span className="font-semibold text-gray-900">Community First</span>
                                </div>
                                <div className="flex flex-col gap-2 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                                    <Heart className="h-6 w-6 text-purple-600" />
                                    <span className="font-semibold text-gray-900">Spiritual Growth</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-3xl transform rotate-3 scale-105 opacity-90"></div>
                            <div className="relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100 grid grid-cols-2 gap-">
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-2xl">
                                        <Bell className="h-8 w-8 text-primary mb-2" />
                                        <h3 className="font-bold text-gray-900">Smart Wakeups</h3>
                                        <p className="text-xs text-gray-500 mt-1">Real time alerts from your group</p>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-2xl">
                                        <Sparkles className="h-8 w-8 text-orange-600 mb-2" />
                                        <h3 className="font-bold text-gray-900">Daily Duas</h3>
                                        <p className="text-xs text-gray-500 mt-1">Curated spiritual content</p>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-8">
                                    <div className="bg-green-50 p-4 rounded-2xl">
                                        <Globe className="h-8 w-8 text-green-600 mb-2" />
                                        <h3 className="font-bold text-gray-900">Global Times</h3>
                                        <p className="text-xs text-gray-500 mt-1">Accurate prayer timings worldwide</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
