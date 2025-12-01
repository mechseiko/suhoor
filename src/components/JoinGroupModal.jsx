import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'

export default function JoinGroupModal({ onClose, onSuccess }) {
    const { currentUser } = useAuth()
    const [groupKey, setGroupKey] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Find group by key
            const groupsRef = collection(db, 'groups')
            const q = query(groupsRef, where('group_key', '==', groupKey.toUpperCase()))
            const querySnapshot = await getDocs(q)

            if (querySnapshot.empty) {
                setError('Group not found. Please check the group key.')
                setLoading(false)
                return
            }

            const groupDoc = querySnapshot.docs[0]
            const groupId = groupDoc.id

            // Check if already a member
            const membersRef = collection(db, 'group_members')
            const memberQ = query(
                membersRef,
                where('group_id', '==', groupId),
                where('user_id', '==', currentUser.uid)
            )
            const memberSnapshot = await getDocs(memberQ)

            if (!memberSnapshot.empty) {
                setError('You are already a member of this group.')
                setLoading(false)
                return
            }

            // Add member
            await addDoc(collection(db, 'group_members'), {
                group_id: groupId,
                user_id: currentUser.uid,
                role: 'member',
                joined_at: serverTimestamp(),
            })

            onSuccess()
        } catch (err) {
            setError('Failed to join group. Please try again.')
            console.error('Error joining group:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Join a Group</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Group Key
                        </label>
                        <input
                            type="text"
                            value={groupKey}
                            onChange={e => setGroupKey(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
                            placeholder="ABC123XY"
                            maxLength={8}
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            Enter the 8-character group key shared with you
                        </p>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                        >
                            {loading ? 'Joining...' : 'Join Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

