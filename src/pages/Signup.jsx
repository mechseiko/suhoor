import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthWrapper from '../components/AuthWrapper'
import { Eye, EyeOff } from 'lucide-react'
import { db } from '../config/firebase'
import { collection, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore'

export default function Signup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { signup } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            return setError('Passwords do not match')
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters')
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return setError('Please enter a valid email address')
        }

        setLoading(true)

        try {
            const userCredential = await signup(email, password)
            const user = userCredential.user

            // Create initial profile in Firestore
            await setDoc(doc(db, 'profiles', user.uid), {
                uid: user.uid,
                email: email,
                display_name: email.split('@')[0],
                isVerified: false,
                createdAt: serverTimestamp()
            })

            navigate('/dashboard?m=n')

        } catch (err) {
            console.error('Signup Error:', err)
            if (err.message.includes("Could not send")) {
                setError(err.message)
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Email is already in use by another account.')
            } else {
                setError('Failed to create account. Please try again.')
            }
        } finally {
            setLoading(false)
        }
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
                    className="w-full bg-primary text-white py-3 rounded-lg hover:opacity-90 cursor-pointer font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating account...' : 'Sign Up'}
                </button>
            </form>
        </AuthWrapper>
    )
}
