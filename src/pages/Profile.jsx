import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Save, LogOut, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from 'firebase/auth'
import { db } from '../config/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import Loader from '../components/Loader'
import DashboardLayout from '../layouts/DashboardLayout'

export default function Profile() {
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        display_name: '',
        email: ''
    })
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser) return
            try {
                const docRef = doc(db, 'profiles', currentUser.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setProfile({ ...docSnap.data() })
                } else {
                    // Fallback if profile doesn't exist yet
                    setProfile({
                        display_name: currentUser.displayName || '',
                        email: currentUser.email
                    })
                }
            } catch (err) {
                console.error('Error fetching profile:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [currentUser])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const docRef = doc(db, 'profiles', currentUser.uid)
            await setDoc(docRef, {
                display_name: profile.display_name
            }, { merge: true })

            // Sync with Firebase Auth profile
            await updateProfile(currentUser, {
                displayName: profile.display_name
            })

            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } catch (err) {
            console.error('Error updating profile:', err)
            setMessage({ type: 'error', text: 'Failed to update profile.' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your identity and preferences</p>
                    </div>

                    <div className="p-6">
                        {message.text && (
                            <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={currentUser?.email}
                                        disabled
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-100 rounded-xl bg-gray-50 text-gray-500 sm:text-sm"
                                    />
                                </div>
                                <p className="mt-1 text-[10px] text-gray-400">Email is fixed to your account</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Display Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={profile.display_name}
                                        onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 shadow-lg shadow-blue-200 transition-all font-medium disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>Update Profile</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
