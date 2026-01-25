import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import AuthWrapper from '../components/AuthWrapper'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { CheckCircle, XCircle, Loader2, Bell, Shield } from 'lucide-react'

export default function VerifyEmail() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [status, setStatus] = useState('verifying')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const { currentUser } = useAuth()

    useEffect(() => {
        if (token) {
            verifyToken()
        } else if (currentUser) {
            setStatus('pending')
            setMessage('')
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

            await updateDoc(doc(db, 'email_verifications', verificationDoc.id), {
                verified: true,
                verifiedAt: new Date()
            })

            const uid = verificationDoc.data().uid
            if (uid) {
                const profileRef = doc(db, 'profiles', uid)
                await updateDoc(profileRef, {
                    isVerified: true
                }).catch(async (err) => {
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

            setTimeout(() => {
                navigate(currentUser ? '/dashboard?m=n' : '/login')
            }, 2000)

        } catch (err) {
            console.error('Verification error:', err)
            setStatus('error')
            setMessage('An error occurred during verification. Try this later in your profile page.')
        }
    }

    return (
        <AuthWrapper
            title={status === 'success' ? "Verification Successful" : status === 'error' ? "Verification Failed" : "Verify Your Email"}
            subtitle={status === 'pending' ? `Check your inbox at ${currentUser?.email}` : status === 'verifying' ? "Please wait..." : ""}
            // bottomTitle="Need help?"
            // bottomsubTitle="Login"
        >
            <div className="text-center">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                        <p className="text-gray-600">Verifying your email...</p>
                    </div>
                )}

                {(status === 'sent' || status === 'pending') && (
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 p-4 rounded-full mb-6">
                            <Bell className="w-10 h-10 text-primary animate-bounce" />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-6 w-full">
                            <p className="text-sm text-blue-800 font-medium text-center">
                                Check your email inbox and click the verification link to continue.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full bg-primary text-white py-3 rounded-lg hover:opacity-90 cursor-pointer font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Resend Verification Email
                            </button>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-10 h-10 text-green-500 mb-4" />
                        <p className="text-gray-600 mb-6">{message}</p>
                        <p className="text-sm text-gray-500 mb-4">You will be redirected shortly...</p>
                        <button
                            className="w-full cursor-pointer bg-primary text-white py-3 rounded-lg hover:opacity-90 font-medium transition"
                            onClick={() => navigate(currentUser ? '/dashboard?m=n' : '/login')}
                        >
                            {currentUser ? 'Go to Dashboard' : 'Login Now'}
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <p className="text-gray-600 mb-6">{message}</p>
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
