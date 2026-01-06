import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../config/firebase'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

export default function JoinGroupModal({ onClose, onSuccess, linkGroupKey }) {
    const navigate = useNavigate();
    const { currentUser } = useAuth()
    const [groupKey, setGroupKey] = useState('')
    const [invitedGroupName, setInvitedGroupName] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(linkGroupKey !== null || '' ? true : false)
    const [error, setError] = useState('')
    const iWantToJoin = (linkGroupKey !== null || '') && status === true;

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Find group by key
            const groupsRef = collection(db, 'groups')
            const q = query(groupsRef, where('group_key', '==', (groupKey || linkGroupKey).toUpperCase()))
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

    useEffect(() => {
        const fetchInvitedGroup = async () => {
            if (iWantToJoin) {
                try {
                    const groupsRef = collection(db, 'groups')
                    const q = query(groupsRef, where('group_key', '==', linkGroupKey))
                    const querySnapshot = await getDocs(q)
                    if (!querySnapshot.empty) {
                        setInvitedGroupName(querySnapshot.docs[0].data().name)
                    }
                } catch (err) {
                    console.error("Error fetching invited group:", err)
                }
            }
        }
        fetchInvitedGroup();
    }, [linkGroupKey])

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Join a Group</h3>
                        <p className="text-gray-500 text-sm mt-1">Enter a key to join an existing group</p>
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

                {invitedGroupName && iWantToJoin && (
                    <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl mb-6 text-sm">
                        You have {status === true ? 'been invited' : 'rejected'} to join <span className="font-bold">{invitedGroupName}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Group Key
                        </label>
                        <input
                            type="text"
                            value={iWantToJoin ? linkGroupKey : groupKey}
                            disabled={status === true}
                            onChange={e => setGroupKey(e.target.value)}
                            required
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 text-gray-900 uppercase font-mono tracking-wider"
                            placeholder="ABC123XY"
                            maxLength={8}
                        />
                        {!iWantToJoin && (
                            <p className="text-xs text-gray-500 mt-2">
                                Enter the 8-character code shared with you
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={iWantToJoin ? () => {setStatus(false); navigate('/dashboard')} : onClose}
                            className="flex-1 px-4 py-3.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                        >
                            {iWantToJoin ? 'Reject' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3.5 bg-primary text-white rounded-xl hover:opacity-90 font-semibold shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Joining...
                                </span>
                            ) : 'Join Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

