import { useState, useEffect } from 'react'
import { User, Mail, Save, Lock, Shield, CheckCircle, AlertCircle, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { db } from '../config/firebase'
import {
    doc,
    getDocs,
    setDoc,
    collection,
    query,
    serverTimestamp,
    onSnapshot,
    addDoc,
    getDoc
} from 'firebase/firestore'

import Loader from '../components/Loader'
import DashboardLayout from '../layouts/DashboardLayout'
import emailjs from 'emailjs-com'
import { Eye, EyeOff } from 'lucide-react'

export default function Profile() {

    const [loading, setLoading] = useState(true)
    const [sp, setSp] = useState(false);
    const [sp1, setSp1] = useState(false);
    const [sp2, setSp2] = useState(false);
    const [saving, setSaving] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)
    const [sendingVerification, setSendingVerification] = useState(false)

    // Delete Account Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('')
    const [deleteConfirmPhrase, setDeleteConfirmPhrase] = useState('')

    const { currentUser, deleteAccount } = useAuth()

    const [profile, setProfile] = useState({
        display_name: '',
        email: '',
        isVerified: false
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [message, setMessage] = useState({ type: '', text: '' })
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        if (!currentUser) return

        let unsubscribe = () => { }

        const setupProfileListener = async () => {
            try {
                // 1. Check if standard profile (UID as ID) exists
                const standardDocRef = doc(db, 'profiles', currentUser.uid)
                const standardDocSnap = await getDoc(standardDocRef)

                if (standardDocSnap.exists()) {
                    // Subscribe to standard doc
                    unsubscribe = onSnapshot(standardDocRef, (doc) => {
                        if (doc.exists()) {
                            const data = doc.data()
                            setProfile({
                                ...data,
                                isVerified: data.isVerified || currentUser.emailVerified
                            })
                        }
                    })
                } else {
                    // 2. Check for legacy profile (random ID, but has uid field)
                    const q = query(
                        collection(db, 'profiles'),
                        where('uid', '==', currentUser.uid)
                    )
                    const querySnap = await getDocs(q)

                    if (!querySnap.empty) {
                        // Subscribe to the found legacy doc
                        const legacyDocRef = querySnap.docs[0].ref
                        unsubscribe = onSnapshot(legacyDocRef, (doc) => {
                            if (doc.exists()) {
                                const data = doc.data()
                                setProfile({
                                    ...data,
                                    isVerified: data.isVerified || currentUser.emailVerified
                                })
                            }
                        })
                    } else {
                        // 3. No profile found. Subscribe to standard path in case it gets created.
                        unsubscribe = onSnapshot(standardDocRef, (doc) => {
                            if (doc.exists()) {
                                const data = doc.data()
                                setProfile({
                                    ...data,
                                    isVerified: data.isVerified || currentUser.emailVerified
                                })
                                localStorage.setItem('isVerified', data.isVerified || currentUser.emailVerified)
                                window.dispatchEvent(new Event('profile-updated'))
                            } else {
                                // Default state
                                localStorage.setItem('isVerified', currentUser.emailVerified || false)
                                window.dispatchEvent(new Event('profile-updated'))
                                setProfile({
                                    display_name: currentUser.displayName || '',
                                    email: currentUser.email,
                                    isVerified: currentUser.emailVerified || false
                                })
                            }
                        })
                    }
                }
            } catch (err) {
                console.error('Error setting up profile listener:', err)
            } finally {
                setLoading(false)
            }
        }

        setupProfileListener()

        return () => unsubscribe()
    }, [currentUser])


    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            // Try updating standard profile path first
            const standardDocRef = doc(db, 'profiles', currentUser.uid)
            // We use setDoc with merge: true which will create if not exists or update if exists
            // But we should check if legacy exists first to avoid creating a duplicate if user is legacy?
            // Actually, if we want to migrate, creating a new standard doc is fine, but data might be split.
            // Let's stick to the same logic: check existence.

            const standardDocSnap = await getDoc(standardDocRef)

            if (standardDocSnap.exists()) {
                await setDoc(standardDocRef, { display_name: profile.display_name }, { merge: true })
            } else {
                // Check legacy
                const q = query(
                    collection(db, 'profiles'),
                    where('uid', '==', currentUser.uid)
                )
                const snap = await getDocs(q)

                if (!snap.empty) {
                    await setDoc(snap.docs[0].ref, { display_name: profile.display_name }, { merge: true })
                } else {
                    // Create new standard doc
                    await setDoc(standardDocRef, {
                        display_name: profile.display_name,
                        uid: currentUser.uid,
                        email: currentUser.email,
                        isVerified: currentUser.emailVerified || false,
                        updatedAt: serverTimestamp()
                    }, { merge: true })
                }
            }

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

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setPasswordMessage({ type: '', text: '' })

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' })
            return
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
            return
        }

        setChangingPassword(true)

        try {
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                passwordData.currentPassword
            )

            await reauthenticateWithCredential(currentUser, credential)
            await updatePassword(currentUser, passwordData.newPassword)

            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' })
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            console.error('Error changing password:', err)
            if (err.code === 'auth/wrong-password') {
                setPasswordMessage({ type: 'error', text: 'Current password is incorrect.' })
            } else {
                setPasswordMessage({ type: 'error', text: 'Failed to change password.' })
            }
        } finally {
            setChangingPassword(false)
        }
    }

    const handleSendVerification = async () => {
        setSendingVerification(true)
        setMessage({ type: '', text: '' })

        try {
            // 1. Generate token (same as signup)
            const token =
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15)

            // 2. Store verification record
            await addDoc(collection(db, 'email_verifications'), {
                uid: currentUser.uid,
                email: currentUser.email,
                token,
                verified: false,
                createdAt: serverTimestamp()
            })

            // 3. Build verification link
            const verificationLink =
                `${window.location.origin}/verify-email?token=${token}`

            // 4. EXACT SAME EmailJS template params as signup
            const templateParams = {
                subject: 'Verify Your Account | Suhoor',
                name: 'Suhoor',
                company_name: 'Suhoor',
                title: 'Verify Your Account',
                body_intro: `Welcome to Suhoor! We're excited to have you join our community. To finish setting up your account, please verify your email address.`,
                button_text: 'Verify My Email',
                action_link: verificationLink,
                accent_note: "You're one step away from connecting with your group!",
                user_email: currentUser.email,
                link: window.location.origin
            }
            const SERVICE_ID = 'service_3flsb3n'
            const TEMPLATE_ID = 'template_vhylt41'
            const USER_ID = 'JKRA71R40HTU6vo6W'

            // 5. Send email
            await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID)


            setMessage({
                type: 'success',
                text: 'Verification email sent! Please check your inbox.'
            })
        } catch (err) {
            console.error('Verification resend error:', err)
            setMessage({
                type: 'error',
                text: 'Failed to send verification email.'
            })
        } finally {
            setSendingVerification(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Account Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h2 className="text-lg font-bold text-gray-900">Account Information</h2>
                        <p className="text-sm text-gray-500 mt-1">Update your personal details</p>
                    </div>

                    <div className="p-6">
                        {message.text && (
                            <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
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
                                <div className="mt-2 flex items-center gap-2">
                                    {profile?.isVerified ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200">
                                            <CheckCircle className="h-3 w-3" />
                                            Verified
                                        </span>
                                    ) : (
                                        <>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg border border-yellow-200">
                                                <AlertCircle className="h-3 w-3" />
                                                Not Verified
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleSendVerification}
                                                disabled={sendingVerification}
                                                className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
                                            >
                                                {sendingVerification ? 'Sending...' : 'Send Verification Email'}
                                            </button>
                                        </>
                                    )}
                                </div>
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
                                    className="w-full cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 shadow-lg shadow-blue-200 transition-all font-medium disabled:opacity-50"
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

                {/* Security Settings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Security
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Change your password</p>
                    </div>

                    <div className="p-6">
                        {passwordMessage.text && (
                            <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {passwordMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                {passwordMessage.text}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={sp ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="Enter current password"
                                        required
                                    />
                                    <span
                                        onClick={() => setSp(!sp)}
                                        className={`${sp ? 'text-primary' : 'text-gray-500'} absolute right-3 top-3 cursor-pointer`}
                                    >
                                        {sp ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={sp1 ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="Enter new password"
                                        required
                                        minLength={6}
                                    />
                                    <span
                                        onClick={() => setSp1(!sp1)}
                                        className={`${sp1 ? 'text-primary' : 'text-gray-500'} absolute right-3 top-3 cursor-pointer`}
                                    >
                                        {sp1 ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-gray-400">Minimum 6 characters</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className='relative'>
                                        <input
                                            type={sp2 ? 'text' : 'password'}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                                            placeholder="Confirm new password"
                                            required
                                            minLength={6}
                                        />
                                        <span
                                            onClick={() => setSp2(!sp2)}
                                            className={`${sp2 ? 'text-primary' : 'text-gray-500'} absolute right-3 top-3 cursor-pointer`}
                                        >
                                            {sp2 ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={changingPassword}
                                    className="w-full cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 shadow-lg shadow-blue-200 transition-all font-medium disabled:opacity-50"
                                >
                                    {changingPassword ? 'Changing Password...' : (
                                        <>
                                            <Shield className="h-4 w-4" />
                                            <span>Change Password</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="p-6 border-b border-red-50 bg-red-50/30">
                        <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Danger Zone
                        </h2>
                        <p className="text-sm text-red-600/80 mt-1">Irreversible account actions</p>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900">Delete Account</h3>
                                <p className="text-sm text-gray-500 mt-1">Permanently delete your account and all data</p>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="px-4 cursor-pointer py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 text-lg">Delete Account</h3>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="p-2 hover:bg-gray-100 cursor-pointer rounded-full text-gray-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex gap-3">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p>This action is permanent and cannot be undone. All your data will be wiped immediately.</p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type your email to confirm
                                    </label>
                                    <input
                                        type="email"
                                        value={deleteConfirmEmail}
                                        onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type <span className="font-mono text-red-600 font-bold">"delete my suhoor account"</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteConfirmPhrase}
                                        onChange={(e) => setDeleteConfirmPhrase(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={async () => {
                                        if (deleteConfirmEmail !== currentUser.email) {
                                            alert('Email does not match')
                                            return
                                        }
                                        if (deleteConfirmPhrase !== 'delete my suhoor account') {
                                            alert('Confirmation phrase is incorrect')
                                            return
                                        }

                                        try {
                                            await deleteAccount()
                                        } catch (error) {
                                            console.error("Failed to delete account", error)
                                            if (error.code === 'auth/requires-recent-login') {
                                                alert('Please logout and login again to perform this action.')
                                            } else {
                                                alert('Failed to delete account. Please try again.')
                                            }
                                        }
                                    }}
                                    disabled={deleteConfirmEmail !== currentUser.email || deleteConfirmPhrase !== 'delete my suhoor account'}
                                    className="w-full py-3 bg-red-600 cursor-pointer text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Permanently Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
