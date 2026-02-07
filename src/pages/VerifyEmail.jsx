import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import AuthWrapper from '../components/AuthWrapper'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    addDoc,
    serverTimestamp
} from 'firebase/firestore'
import { CheckCircle, XCircle, Loader2, Bell } from 'lucide-react'
import emailjs from 'emailjs-com'
import Toast from '../components/Toast'

export default function VerifyEmail() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [status, setStatus] = useState('verifying')
    const [message, setMessage] = useState('')
    const [resending, setResending] = useState(false)
    const [resendStatus, setResendStatus] = useState('')
    const [toast, setToast] = useState(null)

    const navigate = useNavigate()
    const { currentUser, loading } = useAuth()

    const SERVICE_ID = 'service_3flsb3n'
    const TEMPLATE_ID = 'template_vhylt41'
    const USER_ID = 'JKRA71R40HTU6vo6W'

    useEffect(() => {
        if (loading) return

        if (token) {
            verifyToken()
        } else {
            setStatus('pending')
        }
    }, [token, loading])

    const verifyToken = async () => {
        try {
            const q = query(
                collection(db, 'email_verifications'),
                where('token', '==', token),
                where('verified', '==', false)
            )

            const snapshot = await getDocs(q)

            if (snapshot.empty) {
                const msg = 'This verification link has expired or has already been used.'
                setStatus('error')
                setMessage(msg)
                setToast({ message: msg, type: 'error' })
                return
            }

            const verificationDoc = snapshot.docs[0]

            await updateDoc(doc(db, 'email_verifications', verificationDoc.id), {
                verified: true,
                verifiedAt: new Date()
            })

            const uid = verificationDoc.data().uid

            if (uid) {
                try {
                    await updateDoc(doc(db, 'profiles', uid), {
                        isVerified: true
                    })
                } catch {
                    const email = verificationDoc.data().email
                    const profileQuery = query(
                        collection(db, 'profiles'),
                        where('email', '==', email)
                    )
                    const profileSnap = await getDocs(profileQuery)
                    if (!profileSnap.empty) {
                        await updateDoc(doc(db, 'profiles', profileSnap.docs[0].id), {
                            isVerified: true
                        })
                    }
                }
            }

            const msg = 'Your email has been successfully verified!'
            setStatus('success')
            setMessage(msg)
            setToast({ message: msg, type: 'success' })

            setTimeout(() => {
                navigate(currentUser ? '/dashboard?m=n' : '/login')
            }, 1500)

        } catch (err) {
            console.error('Verification error:', err)
            const msg = 'An error occurred during verification. Please try again later.'
            setStatus('error')
            setMessage(msg)
            setToast({ message: msg, type: 'error' })
        }
    }

    const handleResend = async () => {
        if (!currentUser?.email) return

        setResending(true)
        setResendStatus('')

        try {
            const email = currentUser.email
            const token = Math.random().toString(36).substring(2) +
                Math.random().toString(36).substring(2)

            await addDoc(collection(db, 'email_verifications'), {
                uid: currentUser.uid,
                email,
                token,
                createdAt: serverTimestamp(),
                verified: false,
                type: 'resend'
            })

            const verificationLink = `${window.location.origin}/verify-email?token=${token}`

            await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                {
                    subject: 'Suhoor - Verify Your Email',
                    name: 'Suhoor',
                    title: 'Verify Your Email Address',
                    body_intro: 'We received a request to resend your verification email.',
                    button_text: 'Verify My Email',
                    action_link: verificationLink,
                    accent_note: 'If you did not request this action, please ignore this email.',
                    user_email: email,
                    link: window.location.origin
                },
                USER_ID
            )

            setResendStatus('success')
            setToast({ message: 'Email sent successfully! Check your inbox.', type: 'success' })

        } catch (err) {
            console.error('Resend error:', err)
            setResendStatus('error')
            setToast({ message: 'Failed to send email. Please try again later.', type: 'error' })
        } finally {
            setResending(false)
        }
    }

    const ResendEmail = ({showPrompt = true}) => {
        return (
            <>
                <div className="mt-5">
                    <p className="text-center text-gray-600 mb-5">
                        {showPrompt && 
                            <>
                            {resending ? '' : resendStatus === 'success' ? '' : "Didn't get the email?"}
                            </>
                        }
                        <button
                            className='text-primary font-medium inline-flex items-center'
                        >
                            {resending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                            {resending ? 'Sending...' : resendStatus === 'success' ? 'Email Sent' : ''}
                        </button>
                    </p>
                </div>

                <button
                    className="w-full bg-primary cursor-pointer text-white py-3 rounded-lg hover:opacity-90 font-medium"
                    onClick={(!resending || !resendStatus === 'success') && handleResend}
                >
                    Resend Verification Email
                </button>
            </>
        )
    }

    return (
        <AuthWrapper
            title={
                status === 'success'
                    ? 'Verification Successful'
                    : status === 'error'
                        ? 'Verification Failed'
                        : 'Verify Your Email'
            }
            subtitle={status === 'pending' ? `Check your inbox at ${currentUser?.email || ''}` : ''}
        >
            <div className="text-center">

                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                        <p className="text-gray-600">Verifying your email...</p>
                    </div>
                )}

                {status === 'pending' && (
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 p-4 rounded-full mb-6">
                            <Bell className="w-10 h-10 text-primary animate-bounce" />
                        </div>
                        <ResendEmail />
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                        <p className="text-sm text-gray-500 mb-4">You will be redirected shortly…</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <p className="text-gray-600 mb-4">{message}</p>
                        <ResendEmail showPrompt={false}/>
                    </div>
                )}

            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </AuthWrapper>
    )
}
