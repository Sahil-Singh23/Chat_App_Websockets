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
  
  useEffect(()=>{
    msgsEndRef.current?.scrollIntoView({behavior:"smooth"})
  },[msgs])
  useEffect(()=>{
    try{
      const mountData = localStorage.getItem('newChatSession');
      if (!mountData) {
        window.location.href = '/'; // Redirect instead of returning null
        return;
      }
      const data = JSON.parse(mountData);
      roomCodeRef.current = data.roomCode;
      nicknameRef.current = data.nickname;
      setIsReady(true);
   
        ws.current = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://192.162.1.21:8000');
       
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
                setAlertMessage("joined the room");
                setAlertType('success');
                //write logic for storedMsgs
                const oldMsgs = getLocalMsgs();
                const allMsgs = [...oldMsgs, ...msgs]
                localStorage.setItem('roomMessages',JSON.stringify(allMsgs))

                const transformedMsgs = (allMsgs || []).map((m: any) => {
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
                localStorage.setItem('roomMessages', JSON.stringify([...currentMsgs, backendMsg]));

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

  if (!isReady) return null;

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

  return (
    <section className="min-h-screen bg-[#080605]">
      {showAlert && (
        <Alert 
          message={alertMessage}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      )}
      <Glow></Glow>
      <div className="flex flex-col items-center justify-center min-h-screen px-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-full md:max-w-1/2">
          <div className="flex flex-col items-start p-6 md:p-8 rounded-2xl border border-solid border-neutral-700">
            <div className="flex items-center mb-3 gap-3">
              <ChatIcon></ChatIcon>
              <span className="text-[#FFF6E0] text-xl md:text-2xl font-ntbricksans">
                {"Anonymous Rooms"}
              </span>
            </div>
            <span className="text-white text-xs md:text-sm mb-5 font-sfmono opacity-70">
              {"temporary chats that disappears after all users exit"}
            </span>
            <div className="flex justify-between bg-neutral-800 py-4 px-5 mb-3.25 rounded-2xl border-0 w-full">
              <span className="text-white/80 text-sm">
                {`Room Code: ${roomCodeRef.current}`}
              </span>
              <span className="text-white/80 text-sm">
                {`Users ${userCount}`}
              </span>
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