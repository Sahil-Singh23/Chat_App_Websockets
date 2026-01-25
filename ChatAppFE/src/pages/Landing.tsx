import { useRef, useState } from "react"
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Github } from 'lucide-react'
import Button from "../components/Button"
import Input from "../components/Input"
import ChatIcon from "../icons/ChatIcon"
import Glow from "../components/Glow"
import Alert from "../components/Alert"

const Landing = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const roomRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('success');
  const navigate = useNavigate();
  const fallBackUrl = 'http://192.168.1.30:8000';

  async function CreateRoom(){
    setIsLoading(true);
    try{
      const response = await axios.post(`${import.meta.env.VITE_API_URL || fallBackUrl}/api/v1/create`)
      if(roomRef.current) {
        roomRef.current.value = response.data.roomCode;
        //await navigator.clipboard.writeText(response.data.roomCode);
        setAlertMessage("Room created!");
        setAlertType('success');
        setShowAlert(true);
      }
    }catch (error) {
      console.error('Error creating room:', error)
      setAlertMessage("Failed to create room. Please try again.");
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function JoinRoom(){
    setIsJoining(true);
    const roomCode = roomRef.current?.value
    const nickname = nameRef.current?.value
    
    if(!roomCode || !nickname) {
      setAlertMessage("Please enter both nickname and room code");
      setAlertType('error');
      setShowAlert(true);
      setIsJoining(false);
      return;
    }
    
    try{
      const response = await axios.post(`${import.meta.env.VITE_API_URL || fallBackUrl}/api/v1/room/${roomCode}`)
      if(response.data) {
        sessionStorage.setItem('newChatSession', JSON.stringify({ roomCode, nickname }));
        navigate(`/room/${roomCode}`);
      }
    }catch(e: any){
      if(e.response?.status === 404) {
        setAlertMessage("Invalid room code. Please check and try again.");
        setAlertType('error');
      } else {
        setAlertMessage("Failed to join room. Please try again.");
        setAlertType('error');
      }
      setShowAlert(true);
    } finally {
      setIsJoining(false);
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
      <Glow></Glow>
      <section className="fixed top-6 right-6 md:right-25 z-50">
        <a
          href="https://github.com/Sahil-Singh23/Chat_App_Websockets"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-neutral-600 px-3 py-1 rounded-lg text-neutral-400 text-sm hover:text-neutral-300 hover:border-neutral-500 transition-all duration-200 whitespace-nowrap"
        >
          <Github size={16} />
          Star us on GitHub
        </a>
      </section>
      <div className="flex flex-col items-center justify-center min-h-screen px-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-full md:max-w-1/2">
          <div className="flex flex-col items-start p-6 md:p-8 rounded-2xl border border-solid border-neutral-700">
            <div className="flex items-center mb-3 gap-3 justify-between w-full">
              <div className="flex items-center gap-3">
                <ChatIcon></ChatIcon>
                <span className="text-[#FFF6E0] text-xl md:text-2xl font-ntbricksans">
                  {"Anonymous Rooms"}
                </span>
              </div>
              
            </div>
            <span className="text-white text-xs md:text-sm mb-5 font-sfmono opacity-70">
							{"temporary chats that disappears after all users exit"}
						</span>
            <Button onClick={CreateRoom} width="w-full" text={isLoading ? "Creating..." : "Create new room"} disabled={isLoading||isJoining}></Button>
            <div className="mt-4 w-full">
              <Input 
                width="w-full" 
                ref={nameRef} 
                placeholder="Enter nickname"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    JoinRoom();
                  }
                }}
              ></Input>
            </div>
            <div className="flex flex-col sm:flex-row mt-4 w-full gap-4 md:gap-2">
              <Input 
                width="w-full sm:w-4/6" 
                ref={roomRef} 
                placeholder="Enter room code"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    JoinRoom();
                  }
                }}
              ></Input>
              <Button width="w-full sm:w-2/6" disabled={isLoading||isJoining} onClick={JoinRoom} text={isJoining ? "Joining..." : "Join"} ></Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Landing
