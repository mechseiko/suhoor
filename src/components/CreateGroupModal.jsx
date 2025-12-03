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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-dark">Create New Group</h3>
                    <button
                        onClick={onClose}
                        className="text-dark/40 hover:text-dark/60"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark/80 mb-2">
                            Group Name
                        </label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="Family Suhoor Group"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
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
                            {loading ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

