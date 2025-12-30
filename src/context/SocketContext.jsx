import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const useSocket = () => {
    const context = useContext(SocketContext)
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider')
    }
    return context
}

export const SocketProvider = ({ children }) => {
    const { currentUser } = useAuth()
    const [socket, setSocket] = useState(null)
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState(null)

    // Initialize socket connection
    useEffect(() => {
        if (!currentUser) {
            // Disconnect if user logs out
            if (socket) {
                socket.disconnect()
                setSocket(null)
                setIsConnected(false)
            }
            return
        }

        // Create socket connection
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

        const newSocket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            auth: {
                userId: currentUser.uid
            }
        })

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id)
            setIsConnected(true)
            setError(null)
        })

        newSocket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason)
            setIsConnected(false)
        })

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err)
            setError(err.message)
            setIsConnected(false)
        })

        newSocket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Socket reconnected after', attemptNumber, 'attempts')
            setIsConnected(true)
            setError(null)
        })

        newSocket.on('reconnect_error', (err) => {
            console.error('Reconnection error:', err)
        })

        newSocket.on('reconnect_failed', () => {
            console.error('❌ Failed to reconnect')
            setError('Failed to reconnect to server')
        })

        setSocket(newSocket)

        // Cleanup on unmount
        return () => {
            newSocket.disconnect()
        }
    }, [currentUser])

    // Helper function to join a group room
    const joinGroup = useCallback((groupId, userName) => {
        if (socket && currentUser) {
            socket.emit('join-group', {
                userId: currentUser.uid,
                groupId,
                userName: userName || currentUser.email
            })
            console.log(`📍 Joining group: ${groupId}`)
        }
    }, [socket, currentUser])

    // Helper function to leave a group room
    const leaveGroup = useCallback((groupId) => {
        if (socket && currentUser) {
            socket.emit('leave-group', {
                userId: currentUser.uid,
                groupId
            })
            console.log(`👋 Leaving group: ${groupId}`)
        }
    }, [socket, currentUser])

    // Helper function to emit wake-up event
    const emitWakeUp = useCallback((groupId, userName, wakeUpTime) => {
        if (socket && currentUser) {
            socket.emit('wake-up', {
                userId: currentUser.uid,
                groupId,
                userName: userName || currentUser.email,
                wakeUpTime
            })
            console.log(`🌅 Emitting wake-up for group: ${groupId}`)
        }
    }, [socket, currentUser])

    // Helper function to subscribe to events
    const on = useCallback((event, callback) => {
        if (socket) {
            socket.on(event, callback)
        }
    }, [socket])

    // Helper function to unsubscribe from events
    const off = useCallback((event, callback) => {
        if (socket) {
            socket.off(event, callback)
        }
    }, [socket])

    const value = {
        socket,
        isConnected,
        error,
        joinGroup,
        leaveGroup,
        emitWakeUp,
        on,
        off
    }

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    )
}

export default SocketContext
