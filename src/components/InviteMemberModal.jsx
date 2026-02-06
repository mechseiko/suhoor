import { useState } from 'react'
import { X, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

import emailjs from 'emailjs-com'

export default function InviteMemberModal({ groupId, groupName, groupKey, onClose }) {
    const { currentUser } = useAuth()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const SERVICE_ID = 'service_3flsb3n'
    const TEMPLATE_ID = 'template_vhylt41'
    const USER_ID = 'JKRA71R40HTU6vo6W'

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {

            await addDoc(collection(db, 'group_invites'), {
                group_id: groupId,
                invited_by: currentUser.uid,
                email: email,
                status: 'pending',
                created_at: serverTimestamp(),
            })

            const inviteLink = `${window.location.origin}/groups?groupKey=${groupKey}`

            const templateParams = {
                subject: 'Join my group on Suhoor',
                name: 'Suhoor',
                title: 'You\'ve been invited!',
                body_intro: `${currentUser?.displayName || currentUser?.email} has invited you to join their Suhoor group: "${groupName}". \n\n You must be logged in with this email to join the group.`,
                button_text: 'Join Group',
                action_link: inviteLink,
                accent_note: `Group Key: ${groupKey}`,
                user_email: email,
                link: window.location.origin
            }

            await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID)

            setSuccess(true)
            setTimeout(() => {
                onClose()
            }, 2000)
        } catch (err) {
            setError('Failed to send invite. Please try again.')
            console.error('Error creating invite:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-dark">Invite Member</h3>
                    <button
                        onClick={onClose}
                        className="text-dark/40 cursor-pointer hover:text-dark/60"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="h-8 w-8 text-accent" />
                        </div>
                        <h4 className="text-xl font-semibold text-dark mb-2">
                            Invite Sent!
                        </h4>
                        <p className="text-dark/70">
                            An invitation has been sent to {email}
                        </p>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark/80 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    placeholder="friend@example.com"
                                />
                                <p className="text-sm text-dark/70 mt-2">
                                    They'll need to sign up with this email to join
                                </p>
                            </div>

                            <div className="flex space-x-3 pt-4 *:cursor-pointer">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-muted text-dark/80 rounded-lg hover:bg-muted/30 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send Invite'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}

