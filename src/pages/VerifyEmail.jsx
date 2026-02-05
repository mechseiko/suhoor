import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import AuthWrapper from '../components/AuthWrapper'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore'
import { CheckCircle, XCircle, Loader2, Bell, Shield } from 'lucide-react'
import emailjs from 'emailjs-com'

export default function VerifyEmail() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [status, setStatus] = useState('verifying')
    const [message, setMessage] = useState('')
    const [resending, setResending] = useState(false)
    const [resendStatus, setResendStatus] = useState('')
    const navigate = useNavigate()

    const { currentUser } = useAuth()

    const SERVICE_ID = 'service_3flsb3n'
    const TEMPLATE_ID = 'template_vhylt41'
    const USER_ID = 'JKRA71R40HTU6vo6W'

    useEffect(() => {
        if (token) {
            verifyToken()
        } else if (currentUser) {
            setStatus('pending')
            setMessage('')
        } else {
            setStatus('error')
            setMessage('Invalid verification link. Please log in to resend the verification link.')
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
            setMessage('An error occurred during verification. Try this link later.')
        }
    }

    const handleResend = async () => {
        if (!currentUser || !currentUser.email) return
        setResending(true)
        setResendStatus('')

        try {
            const email = currentUser.email

            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

            await addDoc(collection(db, 'email_verifications'), {
                uid: currentUser.uid,
                email: email,
                token: token,
                createdAt: serverTimestamp(),
                verified: false,
                type: 'resend'
            })

            const verificationLink = `${window.location.origin}/verify-email?token=${token}`
            const templateParams = {
                subject: 'Suhoor - Verify Your Email',
                name: email.split('@')[0],
                company_name: 'Suhoor',
                title: 'Verify Your Email Address',
                body_intro: `We received a request to resend your verification email.`,
                button_text: 'Verify My Email',
                action_link: verificationLink,
                accent_note: 'If you did not request this action, please ignore this email.',
                user_email: email,
                link: window.location.origin
            }

            await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID)
            setResendStatus('success')
        } catch (error) {
            console.error("Resend error:", error)
            setResendStatus('error')
        } finally {
            setResending(false)
        }
    }

    return (
        <AuthWrapper
            title={status === 'success' ? "Verification Successful" : status === 'error' ? "Verification Failed" : "Verify Your Email"}
            subtitle={status === 'pending' ? `Check your inbox at ${currentUser?.email}` : status === 'verifying' ? "Please wait..." : ""}
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

                        {resendStatus === 'success' && (
                            <div className="mb-4 text-green-600 text-sm font-medium">
                                Email sent successfully! Check your inbox.
                            </div>
                        )}
                        {resendStatus === 'error' && (
                            <div className="mb-4 text-red-600 text-sm font-medium">
                                Failed to send email. Please try again later.
                            </div>
                        )}

                        <div className="mt-6">
                            <p className="text-center text-gray-600">
                                Didn't get the email?{' '}
                                <button
                                    onClick={handleResend}
                                    disabled={resending || resendStatus === 'success'}
                                    className="text-primary hover:underline font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                                >
                                    {resending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                                    {resending ? 'Sending...' : resendStatus === 'success' ? 'Email Sent' : 'Resend Verification Email'}
                                </button>
                            </p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
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
