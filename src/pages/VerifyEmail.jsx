import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import AuthWrapper from '../components/AuthWrapper'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { CheckCircle, XCircle, Loader2, Bell, Layout, Shield } from 'lucide-react'

export default function VerifyEmail() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [status, setStatus] = useState('verifying') // verifying, success, error
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const { currentUser, logout } = useAuth() // Get current user and logout function

    useEffect(() => {
        if (token) {
            verifyToken()
        } else if (currentUser) {
            // User arrived here without a token (e.g. from Profile page or manual nav)
            setStatus('pending')
            setMessage(`To verify your email (${currentUser.email}), please check your inbox for the verification link.`)
        } else {
            setStatus('error')
            setMessage('Invalid verification link. Please log in to resend the verification link from your profile.')
        }
    }, [token, currentUser])

    const verifyToken = async () => {
        try {
            const q = query(
                collection(db, 'email_verifications'),
                where('token', '==', token),
                where('verified', '==', false)
            )
            const querySnapshot = await getDocs(q)

            if (querySnapshot.empty) {
                setStatus('error')
                setMessage('This verification link has expired or has already been used.')
                return
            }

            const verificationDoc = querySnapshot.docs[0]

            // 1. Mark verification as done
            await updateDoc(doc(db, 'email_verifications', verificationDoc.id), {
                verified: true,
                verifiedAt: new Date()
            })

            // 2. Update the profile document
            const uid = verificationDoc.data().uid
            if (uid) {
                const profileRef = doc(db, 'profiles', uid)
                // Check if profile exists (for legacy random-ID profiles, we might fallback, but let's assume standard)
                // Actually, let's try to update direct path first.
                await updateDoc(profileRef, {
                    isVerified: true
                }).catch(async (err) => {
                    // Fallback for legacy data: Query by email if direct update fails (e.g. doc doesn't exist at UID path)
                    console.log("Direct profile update failed, trying query fallback", err)
                    const email = verificationDoc.data().email
                    const profilesQuery = query(collection(db, 'profiles'), where('email', '==', email))
                    const profileSnapshot = await getDocs(profilesQuery)

                    if (!profileSnapshot.empty) {
                        await updateDoc(doc(db, 'profiles', profileSnapshot.docs[0].id), {
                            isVerified: true
                        })
                    }
                })
            }

            setStatus('success')
            setMessage('Your email has been successfully verified!')

            // Auto-redirect after 2 seconds
            setTimeout(() => {
                navigate(currentUser ? '/dashboard' : '/login')
            }, 2000)

        } catch (err) {
            console.error('Verification error:', err)
            setStatus('error')
            setMessage('An error occurred during verification. Try this later in your profile page.')
        }
    }

    return (
        <AuthWrapper
            title={status === 'success' ? "Verification Successful" : status === 'error' ? "Verification Failed" : "Verifying Email"}
            subtitle={message || "Please wait while we verify your account..."}
            bottomTitle="Need help?"
            bottomsubTitle="Login"
        >
            <div className="text-center">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                    </div>
                )}

                {(status === 'sent' || status === 'pending') && (
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 p-4 rounded-full mb-6">
                            <Bell className="w-12 h-12 text-primary animate-bounce" />
                        </div>

                        <p className="text-gray-600 mb-8 text-center px-4 leading-relaxed">
                            {message}
                        </p>

                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Layout size={18} />
                                Go to Dashboard
                            </button>

                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full bg-gray-50 text-gray-700 py-4 rounded-2xl font-bold border border-gray-100 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Shield size={18} />
                                View Profile
                            </button>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100 w-full">
                            <button
                                onClick={() => {
                                    logout()
                                    navigate('/login')
                                }}
                                className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors cursor-pointer"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                        <p className="text-gray-600 mb-6">You will be redirected shortly...</p>
                        <button
                            className="w-full cursor-pointer bg-primary text-white py-3 rounded-lg hover:opacity-90 font-medium transition"
                            onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
                        >
                            {currentUser ? 'Go to Dashboard' : 'Login Now'}
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <button
                            className="w-full cursor-pointer bg-primary text-white py-3 rounded-lg hover:opacity-90 font-medium transition"
                            onClick={() => navigate('/login')}
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </AuthWrapper>
    )
}
