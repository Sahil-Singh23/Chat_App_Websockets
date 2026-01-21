# 🎯 Chat App Polish & Reconnection - Complete Implementation Checklist

## 📋 Section 1: Core Reconnection System

### Backend Data Structure Refactor

- [ ] **1.1** Change room storage structure
  ```typescript
  // Old: Map<roomCode, Set<WebSocket>>
  // New: Map<roomCode, RoomData>
  interface RoomData {
    clients: Map<sessionId, ClientInfo>,
    messageHistory: Message[], // last 100 messages
    createdAt: number
  }
  
  interface ClientInfo {
    socket: WebSocket,
    user: string,
    lastSeen: number,
    lastMessageTime: number // for sync
  }
  ```
  **Hint:** Keep old `clients` Map for socket → info lookup during `onmessage`

- [ ] **1.2** Update `join` handler to use sessionId
  - Accept sessionId from client
  - Store in `clients` Map with sessionId as key
  - Check if sessionId already exists (reconnection scenario)

- [ ] **1.3** Add message history storage
  - On every message broadcast, add to `messageHistory` array
  - Limit to 100 messages (use circular buffer or shift oldest)
  - Include timestamp, user, msg, sessionId

### Backend Reconnection Logic

- [ ] **1.4** Create `reconnect` message handler
  ```typescript
  if (data.type === "reconnect") {
    const {sessionId, roomCode, lastMessageTime} = data.payload;
    
    // Check if room exists
    // Check if sessionId was in this room before
    // Replace old socket with new socket
    // Send missed messages
  }
  ```
  
- [ ] **1.5** Implement socket replacement logic
  ```typescript
  if (existingSession) {
    const oldSocket = existingSession.socket;
    oldSocket.close(); // Force close old socket
    existingSession.socket = newSocket; // Replace
    existingSession.lastSeen = Date.now();
  }
  ```
  **Hint:** Update both the `room.clients` Map AND the global `clients` Map

- [ ] **1.6** Add message sync on reconnect
  ```typescript
  const missedMessages = room.messageHistory.filter(
    msg => msg.time > lastMessageTime
  );
  socket.send(JSON.stringify({
    type: "sync",
    payload: { messages: missedMessages }
  }));
  ```

### Backend Grace Period Logic

- [ ] **1.7** Don't immediately broadcast "user-left" on disconnect
  ```typescript
  socket.on("close", () => {
    // Mark lastSeen timestamp
    // Set 30-second timeout
    // If no reconnect in 30s → then broadcast "user-left"
  });
  ```
  **Hint:** Store timeout ID in ClientInfo, clear it if reconnect happens

- [ ] **1.8** Clean up stale sessions
  - Every 60 seconds, check all clients
  - If `lastSeen` > 2 minutes ago → remove
  - Broadcast "user-left" for removed sessions

---

## 📱 Section 2: Frontend Reconnection

### localStorage Management

- [ ] **2.1** Create localStorage utility functions
  ```typescript
  interface StoredSession {
    sessionId: string,
    roomCode: string,
    nickname: string,
    lastMessageTime: number,
    timestamp: number
  }
  
  const saveSession = (data: StoredSession) => {...}
  const getSession = () => {...}
  const clearSession = () => {...}
  ```

- [ ] **2.2** Save session on initial join
  - After successful join, call `saveSession()`
  - Update `lastMessageTime` on every message received

- [ ] **2.3** Check localStorage on Room mount
  ```typescript
  useEffect(() => {
    const stored = getSession();
    const roomCodeFromUrl = params.roomCode;
    
    if (stored && stored.roomCode === roomCodeFromUrl) {
      // Reconnection flow
    } else {
      // Fresh join flow (existing code)
    }
  }, []);
  ```

### Reconnection WebSocket Flow

- [ ] **2.4** Send "reconnect" instead of "join"
  ```typescript
  ws.current.send(JSON.stringify({
    type: "reconnect",
    payload: {
      sessionId: stored.sessionId,
      roomCode: stored.roomCode,
      lastMessageTime: stored.lastMessageTime
    }
  }));
  ```

- [ ] **2.5** Handle "sync" message from backend
  ```typescript
  else if (data.type === 'sync') {
    const {messages} = data.payload;
    // Append missed messages to state
    setMsgs(prev => [...prev, ...messages]);
  }
  ```

- [ ] **2.6** Update lastMessageTime on every message
  ```typescript
  else if (data.type === 'message') {
    const msgObj = {user, msg, hours, minutes, isSelf};
    setMsgs(m => [...m, msgObj]);
    
    // Update localStorage
    const stored = getSession();
    if (stored) {
      stored.lastMessageTime = time;
      saveSession(stored);
    }
  }
  ```

### Edge Cases

- [ ] **2.7** Handle "room not found" on reconnect
  - Show alert: "Room no longer exists"
  - Clear localStorage
  - Redirect to landing page

- [ ] **2.8** Clear localStorage on intentional leave
  - When user clicks "Leave Room" button
  - Call `clearSession()` before navigating away

---

## 🔗 Section 3: Link Sharing & Copy

### Auto-Copy on Room Creation

- [ ] **3.1** Update `CreateRoom()` in Landing.tsx
  ```typescript
  const roomLink = `${window.location.origin}/room/${response.data.roomCode}`;
  await navigator.clipboard.writeText(roomLink); // Copy link instead of code
  setAlertMessage("Room link copied to clipboard!");
  ```

### Share Link Button in Room

- [ ] **3.2** Add state for ShareLinkModal in Room.tsx
  ```typescript
  const [showShareModal, setShowShareModal] = useState(false);
  const roomLink = `${window.location.origin}/room/${state.roomCode}`;
  ```

- [ ] **3.3** Add share button in Room UI
  - Place next to user count or room code display
  - Use a share icon or "Invite" text
  - Opens ShareLinkModal on click

- [ ] **3.4** Render ShareLinkModal component
  ```typescript
  <ShareLinkModal 
    isOpen={showShareModal}
    onClose={() => setShowShareModal(false)}
    roomLink={roomLink}
  />
  ```

---

## 🚪 Section 4: Leave Room Button

- [ ] **4.1** Add Leave button in Room.tsx
  - Position: Top-right or bottom of room info section
  - Style: Subtle, secondary button or icon

- [ ] **4.2** Implement leave handler
  ```typescript
  const leaveRoom = () => {
    ws.current?.close(); // Close WebSocket
    clearSession(); // Clear localStorage
    navigate('/'); // Navigate to landing
  };
  ```
  **Hint:** WebSocket `onclose` handler already cleans up backend

- [ ] **4.3** Optional: Add confirmation modal
  - "Are you sure you want to leave?"
  - Prevents accidental exits

---

## ⌨️ Section 5: Typing Indicator

### Backend Typing Broadcast

- [ ] **5.1** Add "typing" message type handler
  ```typescript
  else if (data.type === "typing") {
    const {isTyping} = data.payload;
    const {user, roomCode} = clients.get(socket);
    
    // Broadcast to others in room (not sender)
    broadcast(roomCode, {
      type: "user-typing",
      payload: {user, isTyping}
    }, socket); // exclude sender
  }
  ```

### Frontend Typing Detection

- [ ] **5.2** Add typing state in Room.tsx
  ```typescript
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  ```

- [ ] **5.3** Create debounced typing handler
  ```typescript
  const handleTyping = () => {
    // Send "typing: true" to server
    ws.current?.send(JSON.stringify({
      type: "typing",
      payload: {isTyping: true}
    }));
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to send "typing: false" after 300ms
    typingTimeoutRef.current = setTimeout(() => {
      ws.current?.send(JSON.stringify({
        type: "typing",
        payload: {isTyping: false}
      }));
    }, 300);
  };
  ```

- [ ] **5.4** Attach to Input onChange
  ```typescript
  <Input 
    onChange={handleTyping}
    // ... other props
  />
  ```
  **Hint:** Update Input component to accept `onChange` prop

- [ ] **5.5** Handle "user-typing" messages
  ```typescript
  else if (data.type === 'user-typing') {
    const {user, isTyping} = data.payload;
    
    setTypingUsers(prev => 
      isTyping 
        ? [...prev.filter(u => u !== user), user] // Add if not present
        : prev.filter(u => u !== user) // Remove
    );
  }
  ```

### Typing Indicator UI

- [ ] **5.6** Display typing indicator below messages
  ```typescript
  {typingUsers.length > 0 && (
    <div className="text-xs text-white/50 font-sfmono px-2">
      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
    </div>
  )}
  ```

- [ ] **5.7** Add subtle animation (optional)
  - Fading dots: "typing..."
  - Use CSS keyframes or Tailwind animate

---

## 🎨 Section 6: UI Polish

### Update Input Component

- [ ] **6.1** Add onChange prop to Input.tsx
  ```typescript
  type inputProps = {
    placeholder: string,
    width: string,
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void // NEW
  }
  ```

### Button Variations

- [ ] **6.2** Create "Leave" button variant (optional)
  - Different color scheme (red/warning)
  - Or use subtle ghost button style

### Animation for scale-in

- [ ] **6.3** Add to index.css (if not exists)
  ```css
  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  ```

---

## 🧪 Section 7: Testing Checklist

### Manual Testing Flow

- [ ] **7.1** Test reconnection on same device
  - Join room → switch tab for 10s → return
  - Should reconnect without "user joined" spam
  - Should receive messages sent while away

- [ ] **7.2** Test reconnection after WiFi drop
  - Join room → disable WiFi → re-enable → refresh
  - Should reconnect with same sessionId

- [ ] **7.3** Test link sharing
  - Create room → copy link → open in incognito
  - Should show nickname prompt → join successfully

- [ ] **7.4** Test typing indicator
  - Two users in room
  - Type in one → should appear in other after 300ms
  - Stop typing → should disappear

- [ ] **7.5** Test leave button
  - Click leave → should return to landing
  - Should not appear in room anymore (check with 2nd user)

### Edge Case Testing

- [ ] **7.6** Test stale room reconnection
  - Join room → close all users → wait 5 min → reconnect
  - Should show "room no longer exists"

- [ ] **7.7** Test duplicate tabs
  - Open same room in 2 tabs with same localStorage
  - Both should work independently (2 separate sessions)

- [ ] **7.8** Test message history limit
  - Send 150 messages → reconnect
  - Should only receive last 100

---

## 🚀 Section 8: Deployment Updates

### Environment Variables

- [ ] **8.1** Update frontend .env.example
  ```
  VITE_APP_URL=http://localhost:5173  # For link generation
  VITE_API_URL=http://localhost:8000
  VITE_WS_URL=ws://localhost:8000
  ```

- [ ] **8.2** Use env var for link generation
  ```typescript
  const roomLink = `${import.meta.env.VITE_APP_URL || window.location.origin}/room/${roomCode}`;
  ```

### Backend Memory Management

- [ ] **8.3** Add cleanup job
  ```typescript
  setInterval(() => {
    cleanupStaleRooms();
    cleanupStaleClients();
  }, 60000); // Every minute
  ```

- [ ] **8.4** Add room expiry
  - Delete rooms with no activity for 1 hour
  - Or rooms older than 24 hours

---

## 💡 Pro Tips from a Senior Engineer:

**For Reconnection:**
- Always close old socket before replacing - prevents ghost connections
- Use a grace period of 30s before "user-left" - mobile networks are flaky
- Don't store entire message history - 100 is plenty for a "temporary" chat

**For Typing Indicator:**
- 300ms debounce is perfect - feels responsive but not spammy
- Always send `isTyping: false` when input loses focus
- Limit typing indicator to first 3 users if room is crowded

**For Testing:**
- Test on actual mobile (not just Chrome DevTools mobile mode)
- Simulate slow network with Chrome throttling
- Test with airplane mode on/off to simulate connection drops

**Common Pitfalls:**
- Forgetting to clear timeouts → memory leaks
- Not handling `null` sessionId on first join
- Broadcasting typing to sender (creates echo)
- Not awaiting transaction BEGIN/COMMIT in unrelated code 😉

---

## ⏱️ Estimated Time:

- **Reconnection:** 3-4 hours
- **Message history:** 1-2 hours  
- **Link sharing + Leave:** 30 minutes
- **Typing indicator:** 1-2 hours
- **Testing:** 1-2 hours

**Total: ~8-12 hours of focused work**

---

## 🗺️ Recommended Implementation Order:

1. Backend data structure (1.1-1.3)
2. Frontend localStorage (2.1-2.3)
3. Reconnection logic (1.4-1.6, 2.4-2.6)
4. Link sharing + Leave button (quick wins)
5. Typing indicator (most complex)
6. Testing everything
