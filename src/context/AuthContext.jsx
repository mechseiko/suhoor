import { createContext, useContext, useState, useEffect } from 'react'

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth'

import { auth } from '../config/firebase'

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

    const [userProfile, setUserProfile] = useState(null)
    const [profileLoading, setProfileLoading] = useState(true)

    useEffect(() => {
        let unsubscribeProfile = () => { }

        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            setCurrentUser(user)

            if (user) {
                // Subscribe to profile updates
                import('firebase/firestore').then(({ doc, onSnapshot }) => {
                    import('../config/firebase').then(({ db }) => {
                        unsubscribeProfile = onSnapshot(doc(db, 'profiles', user.uid), (doc) => {
                            if (doc.exists()) {
                                const profileData = doc.data()
                                setUserProfile(profileData)

                                // Sync verification status if needed
                                if (user.emailVerified && !profileData.isVerified) {
                                    import('firebase/firestore').then(({ updateDoc }) => {
                                        updateDoc(doc.ref, { isVerified: true })
                                            .catch(err => console.error("Error syncing verification status:", err))
                                    })
                                }
                            }
                            setProfileLoading(false)
                        }, (error) => {
                            console.error("Profile listen error:", error)
                            setProfileLoading(false)
                        })
                    })
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
        userProfile,
        profileLoading,
        signup,
        login,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

