import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthWrapper from '../components/AuthWrapper'
import { Eye, EyeOff } from 'lucide-react'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import emailjs from 'emailjs-com'

export default function Signup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [success, setSuccess] = useState(false)
    const { signup } = useAuth()
    const navigate = useNavigate()

    // EmailJS Credentials
    const SERVICE_ID = 'service_3flsb3n'
    const TEMPLATE_ID = 'template_vhylt41'
    const USER_ID = 'JKRA71R40HTU6vo6W'

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            return setError('Passwords do not match')
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters')
        }

        setLoading(true)

        try {
            const userCredential = await signup(email, password)
            const user = userCredential.user

            // Create initial profile in Firestore
            await addDoc(collection(db, 'profiles'), {
                uid: user.uid,
                email: email,
                display_name: email.split('@')[0],
                isVerified: false,
                createdAt: serverTimestamp()
            })

            // 1. Generate verification token
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

            // 2. Store verification record in Firestore
            await addDoc(collection(db, 'email_verifications'), {
                email: email,
                token: token,
                createdAt: serverTimestamp(),
                verified: false
            })

            // 3. Send verification email via EmailJS (Unified Template)
            const verificationLink = `${window.location.origin}/verify-email?token=${token}`
            const templateParams = {
                subject: 'Verify Your Account | Suhoor',
                name: 'Suhoor',
                company_name: 'Suhoor',
                title: 'Verify Your Account',
                body_intro: `Welcome to Suhoor! We're excited to have you join our community. To finish setting up your account, please verify your email address.`,
                button_text: 'Verify My Email',
                action_link: verificationLink,
                accent_note: "You're one step away from connecting with your group!",
                user_email: email,
                link: window.location.origin
            }

            await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID)

            setSuccess(true)
        } catch (err) {
            console.error('Signup Error:', err)
            setError('Failed to create account. Email may already be in use.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <AuthWrapper
                title="Verify your email"
                subtitle={`We've sent a verification link to ${email}. Please check your inbox to activate your account.`}
                bottomTitle="Didn't get the email?"
                bottomsubTitle="Sign up again"
            >
                <div className="text-center">
                    <button
                        onClick={() => setSuccess(false)}
                        className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:opacity-90 font-medium transition"
                    >
                        Back to Signup
                    </button>
                </div>
            </AuthWrapper>
        )
    }

    return (
        <AuthWrapper error={error} title="Create Account" subtitle="Join Suhoor and stay connected" bottomTitle="Already have an account?" bottomsubTitle="Login">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <div className='relative'>
                        <input
                            type={`${showPassword ? 'text' : 'password'}`}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                            placeholder="••••••••"
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className={`${showPassword ? 'text-primary' : 'text-gray-500'} absolute right-3 top-3.5 cursor-pointer`}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                    </label>
                    <div className='relative'>
                        <input
                            type={`${showConfirmPassword ? 'text' : 'password'}`}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                            placeholder="••••••••"
                        />
                        <span
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={`${showConfirmPassword ? 'text-primary' : 'text-gray-500'} absolute right-3 top-3.5 cursor-pointer`}
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 rounded-lg hover:opacity-90 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating account...' : 'Sign Up'}
                </button>
            </form>
        </AuthWrapper>
    )
}
