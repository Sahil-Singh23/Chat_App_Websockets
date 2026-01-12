# Self vs Other Message Differentiation

## Problem
Need to visually distinguish messages sent by the current user from messages sent by others, with proper alignment and delivery confirmation.

## Solution
Implemented a **sessionId-based approach** where each user gets a unique session identifier that travels with their messages.

---

## Changes Made

### 1. Frontend - Room.tsx

#### Added sessionId Generation
```typescript
const sessionId = useRef<string>(crypto.randomUUID());
```
- Generates unique UUID when component mounts
- Persists for entire session using useRef

#### Updated Message State Type
```typescript
const [msgs,setMsgs] = useState<{user:string,msg:string,hours:number,minutes:number,isSelf:boolean}[]>([])
```
- Added `isSelf: boolean` field to track message ownership

#### Modified Message Sending
```typescript
ws.current.send(JSON.stringify({
    type:"message",
    payload:{
        msg,
        sessionId: sessionId.current  // ← Include sessionId
    }
}))
```

#### Modified Message Receiving
```typescript
else if(data.type == 'message'){
    const {time,msg,user,sessionId:msgSessionId} = data.payload;
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const isSelf = msgSessionId === sessionId.current;  // ← Compare sessionIds
    const msgObj = {user,msg,hours,minutes,isSelf};
    setMsgs((m)=>[...m,msgObj])
}
```

#### Updated Message Component Usage
```tsx
<Message key={i} msg={m.msg} hours={m.hours} minutes={m.minutes} user={m.user} isSelf={m.isSelf}></Message>
```

---

### 2. Frontend - Message.tsx

#### Updated Props Interface
```typescript
type MessageProps = {
    msg:string,
    user: string,
    minutes: number,
    hours: number,
    isSelf: boolean,  // ← New prop
}
```

#### Conditional Styling
```tsx
<div className={`flex flex-col mb-3 ${props.isSelf ? 'items-end' : 'items-start'}`}>
  {/* ... */}
  <div className={`max-w-[70%] w-fit px-4 py-2.5 rounded-2xl border border-neutral-700 ${
    props.isSelf ? 'bg-neutral-700' : 'bg-neutral-800'
  }`}>
    {/* ... */}
  </div>
</div>
```

**Visual Differences:**
- **Self messages**: Aligned right (`items-end`), lighter background (`bg-neutral-700`)
- **Other messages**: Aligned left (`items-start`), darker background (`bg-neutral-800`)

---

### 3. Backend - index.ts

#### Extract sessionId from Payload
```typescript
const {msg, sessionId} = data.payload || {};
```

#### Include sessionId in Broadcast
```typescript
const sendingData = {type: "message",payload:{
    msg,
    user,
    time,
    sessionId  // ← Pass through sessionId
}}
```

#### Broadcast to All Users (Including Sender)
```typescript
for(const cur of sockets){
    cur.send(JSON.stringify(sendingData)); 
}
```
- Removed `if(cur !== socket)` condition
- Now sender receives their own message from server (delivery confirmation)

---

## Benefits

✅ **No duplicate username issues** - Uses unique sessionId instead of username comparison  
✅ **Delivery confirmation** - Messages only appear after server broadcasts them back  
✅ **Clear visual distinction** - Self messages on right with lighter color, others on left with darker color  
✅ **Minimal changes** - Only added one field and comparison logic  
✅ **No breaking changes** - Backward compatible if sessionId is missing (will just mark as not self)

---

## Flow Diagram

```
User sends message
    ↓
Frontend: Generate/attach sessionId → WebSocket
    ↓
Backend: Receive message with sessionId
    ↓
Backend: Broadcast to ALL users (including sender)
    ↓
Frontend: Receive message, compare sessionId
    ↓
If sessionId matches → isSelf = true (right, lighter)
If sessionId differs → isSelf = false (left, darker)
```
