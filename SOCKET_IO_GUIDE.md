# Socket.IO Integration - Quick Start Guide

## 🚀 Running the Application

### Development Mode (Both Servers)

Run both the Vite dev server and Socket.IO server simultaneously:

```bash
npm run dev:all
```

This will start:
- **Vite dev server** on `http://localhost:5173`
- **Socket.IO server** on `http://localhost:3001`

### Individual Servers

**Option 1: Run Vite only**
```bash
npm run dev
```

**Option 2: Run Socket.IO server only**
```bash
npm run server
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env.development)**
```
VITE_SOCKET_URL=http://localhost:3001
```

**Backend (.env.server)**
```
SOCKET_PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## ✨ Features

### Real-Time Wake-Up Notifications
- Instant notifications when group members wake up
- No page refresh required
- Sound alerts for new wake-ups (can be muted)

### Online Presence
- See which members are currently online
- Green dot indicator for active users
- Live member count

### Connection Status
- "Live" badge when connected to Socket.IO server
- Warning message when disconnected
- Auto-reconnection on network issues

## 🧪 Testing

### Test Real-Time Functionality

1. **Start both servers:**
   ```bash
   npm run dev:all
   ```

2. **Open multiple browser windows:**
   - Window 1: `http://localhost:5173`
   - Window 2: `http://localhost:5173` (incognito or different browser)

3. **Join the same group in both windows**

4. **Mark one user as awake:**
   - Click "I'm Awake!" button in Window 1
   - Window 2 should instantly show the update
   - Notification sound should play in Window 2

5. **Check online presence:**
   - Both users should show as "(online)"
   - Green dots should appear next to their names

### Verify Connection

Check the browser console for Socket.IO logs:
- ✅ Socket connected
- 📍 Joining group
- 🌅 Member woke up
- 👥 Online members updated

## 🐛 Troubleshooting

### Socket.IO server not connecting

1. Check if server is running on port 3001:
   ```bash
   npm run server
   ```

2. Verify `.env.development` has correct URL:
   ```
   VITE_SOCKET_URL=http://localhost:3001
   ```

3. Check browser console for connection errors

### No real-time updates

1. Ensure both servers are running (`npm run dev:all`)
2. Check "Live" badge is visible (green)
3. Verify you're in the same group in both windows
4. Check browser console for Socket.IO events

### Sound not playing

1. Click the volume icon to ensure sound is enabled
2. Check browser permissions for audio
3. Some browsers require user interaction before playing audio

## 📦 Production Deployment

### Option 1: Separate Server (Recommended)

Deploy Socket.IO server to:
- Railway
- Render
- Heroku
- Any Node.js hosting

Update `.env.production`:
```
VITE_SOCKET_URL=https://your-socket-server.com
```

### Option 2: Same Server

You can serve both the frontend and Socket.IO from the same Express server by:
1. Building the Vite app: `npm run build`
2. Serving static files from Express
3. Deploying to a single server

## 🔒 Security Notes

- Socket.IO uses the user's Firebase UID for authentication
- Group rooms are isolated - events only broadcast to the correct group
- CORS is configured to only allow your frontend URL
- Consider adding rate limiting for production

## 📝 API Events

### Client → Server
- `join-group` - Join a group room
- `leave-group` - Leave a group room
- `wake-up` - Notify group of wake-up
- `user-status` - Update user status

### Server → Client
- `member-woke-up` - Someone in the group woke up
- `group-members-update` - Online members list updated
- `member-status-update` - Member status changed

## 🎯 Next Steps

- [ ] Deploy Socket.IO server to production
- [ ] Add push notifications for mobile
- [ ] Implement typing indicators
- [ ] Add group chat functionality
- [ ] Create admin dashboard for monitoring connections
