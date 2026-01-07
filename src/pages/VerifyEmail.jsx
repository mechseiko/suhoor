import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import AuthWrapper from '../components/AuthWrapper'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmail() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [status, setStatus] = useState('verifying') // verifying, success, error
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (token) {
            verifyToken()
        } else {
            setStatus('error')
            setMessage('Invalid verification link.')
        }
    }, [token])

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
                navigate('/login')
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
        >
            <div className="text-center">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                        <p className="text-gray-600">Verifying your token...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                        <button
                            className="w-full cursor-pointer bg-primary text-white py-3 rounded-lg hover:opacity-90 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <button
                            className="w-full cursor-pointer bg-primary text-white py-3 rounded-lg hover:opacity-90 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </button>
                    </div>
                )}
            </div>
        </AuthWrapper>
    )
}
