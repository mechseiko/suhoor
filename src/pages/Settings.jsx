import { useState } from 'react'
import { Bell, Shield, ChevronRight, Mail, Globe } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
    const { currentUser, userProfile } = useAuth()
    const [notifications, setNotifications] = useState(true)

    const Section = ({ title, children }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="divide-y divide-gray-50">
                {children}
            </div>
        </div>
    )

    const SettingItem = ({ icon: Icon, label, description, action }) => (
        <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/5 rounded-lg text-primary">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                    {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
                </div>
            </div>
            <div>
                {action}
            </div>
        </div>
    )

    return (
        <DashboardLayout pageTitle="Settings">
            <div className="max-w-2xl mx-auto">
                <Section title="Preferences">
                    <SettingItem
                        icon={Bell}
                        label="Wake Up Alarms"
                        description="Enable loud, persistent alarms for Suhoor"
                        action={
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${notifications ? 'bg-primary' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`${notifications ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </button>
                        }
                    />
                    <SettingItem
                        icon={Globe}
                        label="Community Updates"
                        description="Stay updated with global Suhoor trends"
                        action={
                            <div className="text-sm text-gray-400">Always On</div>
                        }
                    />
                </Section>

                <Section title="Account">
                    <SettingItem
                        icon={Shield}
                        label="Email Address"
                        description={currentUser?.email}
                        action={
                            userProfile?.isVerified ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Verified
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Not Verified
                                </span>
                            )
                        }
                    />
                    <a href="/profile" className="block">
                        <SettingItem
                            icon={Shield}
                            label="Change Password"
                            description="Update your security credentials"
                            action={<ChevronRight className="h-5 w-5 text-gray-400" />}
                        />
                    </a>
                </Section>

                <Section title="Support">
                    <a href="mailto:suhoorapp@gmail.com" className="block">
                        <SettingItem
                            icon={Mail}
                            label="Contact Support"
                            description="suhoorapp@gmail.com"
                            action={<ChevronRight className="h-5 w-5 text-gray-400" />}
                        />
                    </a>
                    <a href="https://devseiko.vercel.app" target="_blank" rel="noopener noreferrer" className="block">
                        <SettingItem
                            icon={Globe}
                            label="Developer"
                            description="mechseiko"
                            action={<ChevronRight className="h-5 w-5 text-gray-400" />}
                        />
                    </a>
                </Section>

                <div className="text-center text-xs text-gray-400 mt-8">
                    Suhoor App v1.0.0
                </div>
            </div>
        </DashboardLayout>
    )
}
