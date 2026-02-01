import { createContext, useContext, useState, useEffect } from 'react'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    deleteUser
} from 'firebase/auth'
import { auth, db } from '../config/firebase'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password)
    }

    const logout = async () => {
        setCurrentUser(null);
        await signOut(auth);
    };

    const deleteAccount = async () => {
        if (currentUser) {
            await deleteUser(currentUser)
            setCurrentUser(null)
        }
    }

    const [userProfile, setUserProfile] = useState(null)
    const [profileLoading, setProfileLoading] = useState(true)

    useEffect(() => {
        let unsubscribeProfile = () => { }

        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            setCurrentUser(user)

            if (user) {
                // Subscribe to profile updates
                unsubscribeProfile = onSnapshot(doc(db, 'profiles', user.uid), (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const profileData = docSnapshot.data()
                        setUserProfile(profileData)

                        // Sync verification status if needed
                        if (user.emailVerified && !profileData.isVerified) {
                            updateDoc(docSnapshot.ref, { isVerified: true })
                                .catch(err => console.error("Error syncing verification status:", err))
                        }
                    }
                    setProfileLoading(false)
                }, (error) => {
                    console.error("Profile listen error:", error)
                    setProfileLoading(false)
                })
            } else {
                setUserProfile(null)
                setProfileLoading(false)
                unsubscribeProfile()
            }
            setLoading(false)
        })

        return () => {
            unsubscribeAuth()
            unsubscribeProfile()
        }
    }, [])

    const value = {
        currentUser,
        loading,
        userProfile,
        profileLoading,
        signup,
        login,
        logout,
        deleteAccount
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

