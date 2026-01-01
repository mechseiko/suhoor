import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthWrapper from '../components/AuthWrapper'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            navigate('/login')
        } catch (err) {
            setError('Failed to send password reset link to email. Email is not registered!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthWrapper error={error} title="Forgot your password?" subtitle="We'll mail you a password reset link" bottomTitle="Remembered your password?" bottomsubTitle="Login">
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

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 rounded-lg hover:opacity-90 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Sending Password Reset Link' : 'Send Reset Link'}
                </button>
            </form>

        </AuthWrapper>
    )
}
