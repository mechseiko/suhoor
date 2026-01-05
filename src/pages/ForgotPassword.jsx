import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthWrapper from '../components/AuthWrapper'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import emailjs from 'emailjs-com'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    // EmailJS Credentials
    const SERVICE_ID = 'service_zh0vj84'
    const TEMPLATE_ID = 'template_ol09wxr'
    const USER_ID = '9nHCjbJ8w8yQTswge'

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // 1. Generate a unique token
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

            // 2. Store token in Firestore with expiry (e.g., 1 hour)
            await addDoc(collection(db, 'password_resets'), {
                email: email,
                token: token,
                createdAt: serverTimestamp(),
                expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
                used: false
            })

            // 3. Send email via EmailJS
            const resetLink = `${window.location.origin}/reset-password?token=${token}`
            const templateParams = {
                user_email: email,
                name: 'MECHSEIKO From Suhoor',
                time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
                subject: 'Reset Your Password - Suhoor',
                message: `😃Hello! You have requested to reset your password. Please click on the link below to reset your password:\n\n${resetLink}`
            }

            await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID)

            setSuccess(true)
        } catch (err) {
            console.error('Forgot Password Error:', err)
            setError('Failed to send reset link. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <AuthWrapper
                title="Check your inbox"
                subtitle={`We've sent a password reset link to ${email}. Please check your email.`}
                bottomTitle="Didn't get the email?"
                bottomsubTitle="Forgot Password"
            >
                <div className="text-center">
                    <Link to="/login" className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:opacity-90 font-medium transition">
                        Back to Login
                    </Link>
                </div>
            </AuthWrapper>
        )
    }

    return (
        <AuthWrapper
            error={error}
            title="Forgot your password?"
            subtitle="Enter your email address and we'll send you a link to reset your password."
            bottomTitle="Remembered your password?"
            bottomsubTitle="Login"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        placeholder="your@email.com"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 rounded-lg hover:opacity-90 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                </button>
            </form>
        </AuthWrapper>
    )
}
