import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Save, LogOut, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import Loader from '../components/Loader'

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
            await updateDoc(docRef, {
                display_name: profile.display_name
            })
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } catch (err) {
            console.error('Error updating profile:', err)
            setMessage({ type: 'error', text: 'Failed to update profile.' })
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/')
        } catch (err) {
            console.error('Logout failed:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Moon className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900 hidden sm:block">Suhoor</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Sign Out"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                            <p className="text-gray-500 mt-1">Manage your account information</p>
                        </div>

                        <div className="p-6">
                            {message.text && (
                                <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 sm:text-sm"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            'Saving...'
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5" />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
