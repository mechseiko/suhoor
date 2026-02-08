import { Bell, Shield, ChevronRight, Mail, Clock, Terminal, Volume2 } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { useState } from 'react'

export default function Settings() {
    const { currentUser, userProfile } = useAuth()

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

    const [updating, setUpdating] = useState(false)

    const updateFastingDefault = async (key, value) => {
        if (!currentUser) return
        setUpdating(true)
        try {
            const userRef = doc(db, 'profiles', currentUser.uid)
            // Handle nested keys like 'preferences.soundEnabled'
            if (key.includes('.')) {
                const [parent, child] = key.split('.')
                await updateDoc(userRef, {
                    [`${parent}.${child}`]: value
                })
            } else {
                await updateDoc(userRef, {
                    [`fastingDefaults.${key}`]: value
                })
            }
        } catch (err) {
            console.error("Error updating setting:", err)
        } finally {
            setUpdating(false)
        }
    }

    const Toggle = ({ value, onToggle, disabled }) => (
        <button
            onClick={onToggle}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer ${value ? 'bg-primary' : 'bg-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    )

    return (
        <DashboardLayout pageTitle="Settings">
            <div className="max-w-2xl mx-auto pb-12">
                <Section title="Fasting Defaults">
                    <p className="px-6 py-2 text-xs text-gray-500 italic">
                        Choose if prompt should default to "Yes" or "No" for these specific days.
                    </p>
                    <SettingItem
                        icon={Clock}
                        label="Mondays & Thursdays"
                        description="Default to fasting on sunnah days"
                        action={
                            <Toggle
                                value={userProfile?.fastingDefaults?.sunnah ?? true}
                                onToggle={() => updateFastingDefault('sunnah', !(userProfile?.fastingDefaults?.sunnah ?? true))}
                                disabled={updating}
                            />
                        }
                    />
                    <SettingItem
                        icon={Clock}
                        label="White Days"
                        description="13th, 14th, 15th of Hijri month"
                        action={
                            <Toggle
                                value={userProfile?.fastingDefaults?.whiteDays ?? true}
                                onToggle={() => updateFastingDefault('whiteDays', !(userProfile?.fastingDefaults?.whiteDays ?? true))}
                                disabled={updating}
                            />
                        }
                    />
                    <SettingItem
                        icon={Clock}
                        label="Ramadan"
                        description="Default to fasting all days of Ramadan (Recommended)"
                        action={
                            <Toggle
                                value={userProfile?.fastingDefaults?.ramadan ?? true}
                                onToggle={() => updateFastingDefault('ramadan', !(userProfile?.fastingDefaults?.ramadan ?? true))}
                                disabled={updating}
                            />
                        }
                    />
                </Section>

                <Section title="Preferences">
                    <SettingItem
                        icon={Volume2}
                        label="Notification Sounds"
                        description="Play sound when anyone tries to wake you up (Recommended)"
                        action={
                            <Toggle
                                value={userProfile?.preferences?.soundEnabled ?? true}
                                onToggle={() => updateFastingDefault('preferences.soundEnabled', !(userProfile?.preferences?.soundEnabled ?? true))}
                                disabled={updating}
                            />
                        }
                    />
                    <SettingItem
                        icon={Bell}
                        label="Wake Up Time"
                        description="Set your own wake up time"
                        action={
                            <a href="/fasting" className="text-sm text-primary font-medium hover:underline">
                                Configure
                            </a>
                        }
                    />
                </Section>

                <Section title="Account">
                    <SettingItem
                        icon={Mail}
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
                            label="Support"
                            description="suhoorapp@gmail.com"
                            action={<ChevronRight className="h-5 w-5 text-gray-400" />}
                        />
                    </a>
                    <a href="https://devseiko.vercel.app" target="_blank" rel="noopener noreferrer" className="block">
                        <SettingItem
                            icon={Terminal}
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
