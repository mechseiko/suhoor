import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.server' });

const app = express();
const httpServer = createServer(app);

// Configure CORS
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
};

app.use(cors(corsOptions));

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
    cors: corsOptions,
    transports: ['websocket', 'polling']
});

// Store active users and their groups
const activeUsers = new Map(); // userId -> { socketId, groupId, userName }
const groupRooms = new Map(); // groupId -> Set of userIds

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Handle user joining a group
    socket.on('join-group', ({ userId, groupId, userName }) => {
        console.log(`👤 User ${userName} (${userId}) joining group ${groupId}`);

        // Leave previous group if any
        const previousData = activeUsers.get(userId);
        if (previousData && previousData.groupId) {
            socket.leave(`group:${previousData.groupId}`);
            const previousRoom = groupRooms.get(previousData.groupId);
            if (previousRoom) {
                previousRoom.delete(userId);
            }
        }

        // Join new group room
        socket.join(`group:${groupId}`);

        // Update user data
        activeUsers.set(userId, { socketId: socket.id, groupId, userName });

        // Update group room
        if (!groupRooms.has(groupId)) {
            groupRooms.set(groupId, new Set());
        }
        groupRooms.get(groupId).add(userId);

        // Notify group about new member online
        const onlineMembers = Array.from(groupRooms.get(groupId) || []);
        io.to(`group:${groupId}`).emit('group-members-update', {
            onlineMembers,
            count: onlineMembers.length
        });

        console.log(`✅ User ${userName} joined group ${groupId}. Online: ${onlineMembers.length}`);
    });

    // Handle user leaving a group
    socket.on('leave-group', ({ userId, groupId }) => {
        console.log(`👋 User ${userId} leaving group ${groupId}`);

        socket.leave(`group:${groupId}`);

        const room = groupRooms.get(groupId);
        if (room) {
            room.delete(userId);

            // Notify remaining members
            const onlineMembers = Array.from(room);
            io.to(`group:${groupId}`).emit('group-members-update', {
                onlineMembers,
                count: onlineMembers.length
            });
        }
    });

    // Handle wake-up notification
    socket.on('wake-up', ({ userId, groupId, userName, wakeUpTime }) => {
        console.log(`🌅 ${userName} woke up in group ${groupId} at ${wakeUpTime}`);

        // Broadcast to all members in the group (including sender for confirmation)
        io.to(`group:${groupId}`).emit('member-woke-up', {
            userId,
            userName,
            wakeUpTime,
            timestamp: new Date().toISOString()
        });
    });

    // Handle user status update
    socket.on('user-status', ({ userId, groupId, status }) => {
        console.log(`📊 User ${userId} status: ${status}`);

        io.to(`group:${groupId}`).emit('member-status-update', {
            userId,
            status,
            timestamp: new Date().toISOString()
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);

        // Find and remove user from active users
        let disconnectedUserId = null;
        let disconnectedGroupId = null;

        for (const [userId, data] of activeUsers.entries()) {
            if (data.socketId === socket.id) {
                disconnectedUserId = userId;
                disconnectedGroupId = data.groupId;
                activeUsers.delete(userId);
                break;
            }
        }

        // Update group room
        if (disconnectedUserId && disconnectedGroupId) {
            const room = groupRooms.get(disconnectedGroupId);
            if (room) {
                room.delete(disconnectedUserId);

                // Notify remaining members
                const onlineMembers = Array.from(room);
                io.to(`group:${disconnectedGroupId}`).emit('group-members-update', {
                    onlineMembers,
                    count: onlineMembers.length
                });
            }
        }
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        activeConnections: io.engine.clientsCount,
        activeGroups: groupRooms.size,
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Socket.IO server running on port ${PORT}`);
    console.log(`📡 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
        console.log('HTTP server closed');
    });
});
