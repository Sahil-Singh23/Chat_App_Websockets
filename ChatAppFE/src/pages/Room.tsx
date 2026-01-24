import ChatIcon from "../icons/ChatIcon"
import Alert from "../components/Alert"
import Glow from "../components/Glow"
import Input from "../components/Input"
import Button from "../components/Button"
import { useEffect, useRef, useState } from "react"
import SendIcon from "../icons/SendIcon"
import Message from "../components/Message"
import { v4 as uuidv4 } from 'uuid'

interface StoredSession{
  roomCode: string ,
  sessionId: string,
  nickname: string,
  timestamp : number
}

const Room = () => {
  const [msgs,setMsgs] = useState<{user:string,msg:string,hours:number,minutes:number,isSelf:boolean}[]>([])
  const msgRef = useRef<HTMLInputElement | null>(null);
  const ws = useRef<WebSocket|null>(null);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const nicknameRef = useRef('');
  const roomCodeRef = useRef('');
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('chatSession');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.sessionId;
      }
      return uuidv4();
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('success');
  const [userCount,setUserCount] = useState<number>(0);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const shareLinkRef = useRef<HTMLInputElement | null>(null);

  function saveSession() {
    const session: StoredSession = {
      roomCode: roomCodeRef.current,
      nickname: nicknameRef.current,
      sessionId: sessionId,
      timestamp: Date.now()
    }
    localStorage.setItem('chatSession',JSON.stringify(session))
  }
  function getSession(){
    const session: string|null = localStorage.getItem('chatSession')
    if(!session) return;
    return JSON.parse(session);
  }
  function lastMessageTime() {
    const stored = localStorage.getItem('roomMessages');
    if (!stored) return 0;
    
    const msgs = JSON.parse(stored);
    return msgs.length > 0 ? msgs[msgs.length - 1].time : 0;
  };
  function getLocalMsgs(){
    const stored = localStorage.getItem('roomMessages');
    if (!stored) return [];
    const msgs = JSON.parse(stored);
    return msgs;
  }

  function trimMessagesToLast100(messages: any[]) {
    if (messages.length > 100) {
      return messages.slice(-100);
    }
    return messages;
  }
  
  useEffect(()=>{
    msgsEndRef.current?.scrollIntoView({behavior:"smooth"})
  },[msgs])
  useEffect(()=>{
    try{
      const params = new URLSearchParams(window.location.search);
      const roomCodeParam = params.get('roomCode');
      
      const mountData = localStorage.getItem('newChatSession');
      
      // If URL has roomCode but no session data, show username modal
      if (roomCodeParam && !mountData) {
        setShowUsernameModal(true);
        return;
      }
      
      // No roomCode param and no session - redirect home
      if (!roomCodeParam && !mountData) {
        window.location.href = '/';
        return;
      }
      
      // Has session data, continue with room setup
      if (!mountData) {
        return;
      }
      
      const data = JSON.parse(mountData);
      const stored = getSession();
      if (stored && stored.roomCode !== data.roomCode) {
          localStorage.removeItem('roomMessages');
      }
      roomCodeRef.current = data.roomCode;
      nicknameRef.current = data.nickname;
      setIsReady(true);
   
        ws.current = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://192.168.1.85:8000');
       
        ws.current.onopen = ()=>{ 
            if(!ws.current) return;
            if (ws.current.readyState !== WebSocket.OPEN) return;
            // In joined handler delete msgs if it belongs to old room
            if (data.roomCode !== roomCodeRef.current) {
                localStorage.removeItem('roomMessages');
            }
            ws.current.send(JSON.stringify({
              type: "join",
              payload: {
                //check wts better to send here from local storage or from here smwereelse 
                roomCode: data.roomCode,
                username: data.nickname,
                sessionId: sessionId,
                lastMessageTime: lastMessageTime()
              }
            }))
            
        }
        
        ws.current.onmessage = (e)=>{
            const data = JSON.parse(e.data);
            if(!data) return;
            if(data.type == "error"){
                const {message} = data.payload;
                if(message.includes('Room closed')){
                  setShowAlert(true);
                  setAlertMessage(message);
                  setAlertType('error');
                  localStorage.removeItem('roomMessages');
                  setTimeout(()=>{
                      window.location.href = '/'; 
                      return;
                  },800)
                }else{
                  setShowAlert(true);
                  setAlertMessage(message);
                  setAlertType('error');
                }
            }
            else if(data.type == "joined"){
                const {userCount,msgs} = data.payload;
                setUserCount(userCount);
                setShowAlert(true);
                setAlertMessage("Joined the room");
                setAlertType('success');
                //write logic for storedMsgs
                const oldMsgs = getLocalMsgs();
                const allMsgs = [...oldMsgs, ...msgs]
                const trimmedMsgs = trimMessagesToLast100(allMsgs);
                localStorage.setItem('roomMessages',JSON.stringify(trimmedMsgs))

                const transformedMsgs = (trimmedMsgs || []).map((m: any) => {
                    const date = new Date(m.time);
                    return {
                        user: m.user,
                        msg: m.msg,
                        hours: date.getHours(),
                        minutes: date.getMinutes(),
                        isSelf: m.sessionId === sessionId
                    };
                });
                setMsgs((prev) => [...prev, ...transformedMsgs]);
                saveSession();
            }
            else if(data.type == "user-joined"){
                const {user,userCount} = data.payload;
                setUserCount(userCount);
                setShowAlert(true);
                setAlertMessage(user+" joined the room");
                setAlertType('info');
            }
            else if(data.type == 'user-left'){
                const {user,userCount} = data.payload;
                setUserCount(userCount);
                setShowAlert(true);
                setAlertMessage(user+" left the room");
                setAlertType('info');
            }
            else if(data.type == 'message'){
                const {time,msg,user,sessionId:msgSessionId} = data.payload;

                //store the message recieved on local storage as well
                const backendMsg = {
                    msg,
                    user,
                    time,
                    sessionId: msgSessionId
                };
                const currentMsgs = getLocalMsgs();
                const updatedMsgs = [...currentMsgs, backendMsg];
                const trimmedMsgs = trimMessagesToLast100(updatedMsgs);
                localStorage.setItem('roomMessages', JSON.stringify(trimmedMsgs));

                //render for ui format 
                const date = new Date(time);
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const isSelf = msgSessionId === sessionId;
                const msgObj = {user,msg,hours,minutes,isSelf};
                setMsgs((m)=>[...m,msgObj])
                
            }
        }
    }catch(e){
        console.log(e)
    }
    return()=>{
        ws.current?.close();
      }
  },[])

  if (!isReady) {
    if (showUsernameModal) {
      return (
        <section className="min-h-screen bg-[#080605] flex items-center justify-center px-3">
          <Glow></Glow>
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-sm w-full">
            <h2 className="text-white text-2xl font-ntbricksans mb-4">Join Room</h2>
            <p className="text-white/70 text-sm mb-6">Enter your username to join the chat</p>
            <input
              ref={usernameInputRef}
              type="text"
              placeholder="Enter username"
              className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-2 text-white placeholder-neutral-500 mb-6 focus:outline-none focus:border-neutral-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJoinWithUsername();
                }
              }}
            />
            <button
              onClick={handleJoinWithUsername}
              className="w-full bg-[#FFFAED] text-black font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Join Room
            </button>
          </div>
        </section>
      );
    }
    return null;
  }

  function sendMessage(){
    if(!ws.current) return;
    if (ws.current.readyState !== WebSocket.OPEN) return;
    if(!msgRef.current) return;
    //write sending msg logic here
    const msg = msgRef.current.value;
    ws.current.send(JSON.stringify({
        type:"message",
        payload:{
            msg,
            sessionId: sessionId
        }
    }))
    msgRef.current.value ="";
  }

  function leaveRoom() {
    ws.current?.close();
    localStorage.removeItem('roomMessages');
    localStorage.removeItem('chatSession');
    localStorage.removeItem('newChatSession');
    window.location.href = '/';
  }

  function copyLink() {
    const url = `${window.location.origin}?roomCode=${roomCodeRef.current}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Anonymous Rooms',
        url: url
      }).catch((err) => {
        console.log('Share failed, showing modal:', err);
        setShowShareModal(true);
      });
    } else {
      // No share API, show modal
      setShowShareModal(true);
    }
  }

  function handleJoinWithUsername() {
    if (!usernameInputRef.current?.value.trim()) {
      setShowAlert(true);
      setAlertMessage('Please enter a username');
      setAlertType('error');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get('roomCode');
    
    if (roomCode) {
      const newSession: StoredSession = {
        roomCode: roomCode,
        nickname: usernameInputRef.current.value,
        sessionId: sessionId,
        timestamp: Date.now()
      };
      localStorage.setItem('newChatSession', JSON.stringify(newSession));
      setShowUsernameModal(false);
      window.location.reload();
    }
  }

  return (
    <section className="min-h-screen bg-[#080605]">
      {showAlert && (
        <Alert 
          message={alertMessage}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      )}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-3 z-50">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-white text-xl font-ntbricksans mb-4">Share Room Link</h2>
            <p className="text-white/70 text-sm mb-4">Copy this link and share it with others:</p>
            <div className="bg-neutral-800 border border-neutral-600 rounded-lg p-3 mb-4 flex items-center gap-2">
              <input
                ref={shareLinkRef}
                type="text"
                readOnly
                value={`${window.location.origin}?roomCode=${roomCodeRef.current}`}
                className="flex-1 bg-transparent text-white text-xs outline-none select-all"
              />
              <button
                onClick={() => {
                  if (shareLinkRef.current) {
                    shareLinkRef.current.select();
                    document.execCommand('copy');
                    setShowAlert(true);
                    setAlertMessage('Link copied!');
                    setAlertType('success');
                    setShowShareModal(false);
                  }
                }}
                className="px-3 py-1 bg-[#FFFAED] text-black text-xs font-semibold rounded hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full px-4 py-2 text-white border border-neutral-600 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <Glow></Glow>
      <div className="flex flex-col items-center justify-center min-h-screen px-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-full md:max-w-1/2">
          <div className="flex flex-col items-start p-6 md:p-8 rounded-2xl border border-solid border-neutral-700">
            <div className="flex items-center mb-3 gap-3 justify-between w-full">
              <div className="flex items-center gap-3">
                <ChatIcon></ChatIcon>
                <span className="text-[#FFF6E0] text-sm tracking-tight md:text-2xl font-ntbricksans">
                  {"Anonymous Rooms"}
                </span>
              </div>
              <button
                onClick={copyLink}
                className="text-white/70 hover:text-white text-xs flex items-center gap-1 transition-colors"
              >
                Share Link ↗
              </button>
            </div>
            <span className="text-white text-[10px] md:text-sm mb-5 font-sfmono opacity-70">
              {"temporary chats that disappears after all users exit"}
            </span>
            <div className="flex justify-between items-center bg-neutral-800 py-2 px-5 mb-3.25 rounded-2xl border-0 w-full h-12">
              <span className="text-white/80 text-sm">
                {`Room Code: ${roomCodeRef.current}`}
              </span>
              <span className="flex gap-4 items-center text-white/80 text-sm">
                <span className="text-white/80 text-sm">
                  {`Users ${userCount}`}
                </span>
                
                <button
                onClick={leaveRoom}
                className="hidden md:block px-4 py-1 text-s text-neutral-300 border border-neutral-600 rounded-[10px] hover:bg-neutral-900 transition-colors whitespace-nowrap"
              >
                Leave Room
              </button>
              </span>
              
              
            </div>
            
            <div className="flex md:hidden gap-2 w-full mb-1">
              <Button 
                width="w-full" 
                onClick={leaveRoom} 
                text="Leave Room" 
                variant="ghost"
              />
            </div>
            <div 
              className="flex flex-col w-full h-[60svh] p-6 md:p-8 rounded-2xl border border-solid border-neutral-700 overflow-y-auto gap-3"
            >
                {msgs.map((m,i)=>(
                    <Message key={i} msg={m.msg} hours={m.hours} minutes={m.minutes} user={m.user} isSelf={m.isSelf}></Message>
                ))}
                <div ref={msgsEndRef}></div>
                {/* all messages will render here */}
            </div>
            <div className="flex flex-row mt-4 w-full gap-4 md:gap-2">
              <Input 
                width="w-5/6" 
                ref={msgRef} 
                placeholder="Type a message"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              ></Input>
              <span className="hidden md:block w-1/6">
              <Button width="w-full" onClick={sendMessage} text={"Send"} ></Button></span>
              <span className="block md:hidden w-1/6">
                <Button width="w-full" onClick={sendMessage} icon={<SendIcon></SendIcon>} ></Button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Room