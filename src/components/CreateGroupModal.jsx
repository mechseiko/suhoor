import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function CreateGroupModal({ onClose, onSuccess }) {
    const { currentUser } = useAuth()
    const [groupName, setGroupName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const generateGroupKey = () => {
        return Math.random().toString(36).substring(2, 10).toUpperCase()
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const groupKey = generateGroupKey()

            // Create group
            const groupRef = await addDoc(collection(db, 'groups'), {
                name: groupName,
                group_key: groupKey,
                created_by: currentUser.uid,
                created_at: serverTimestamp(),
            })

            // Add user as admin member
            await addDoc(collection(db, 'group_members'), {
                group_id: groupRef.id,
                user_id: currentUser.uid,
                role: 'admin',
                joined_at: serverTimestamp(),
            })

            onSuccess()
        } catch (err) {
            setError('Failed to create group. Please try again.')
            console.error('Error creating group:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Create New Group</h3>
                        <p className="text-gray-500 text-sm mt-1">Start a new community for Suhoor</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Group Name
                        </label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            required
                            maxLength={30}
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 text-gray-900"
                            placeholder="e.g. Ayamul-beed circle"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3.5 bg-primary text-white rounded-xl hover:opacity-90 font-semibold shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </span>
                            ) : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

