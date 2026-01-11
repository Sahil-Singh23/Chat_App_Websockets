import { useRef, useState } from "react"
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
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

  async function CreateRoom(){
    setIsLoading(true);
    try{
      const response = await axios.post("http://localhost:8001/api/v1/create")
      if(roomRef.current) {
        roomRef.current.value = response.data.roomCode;
        await navigator.clipboard.writeText(response.data.roomCode);
        setShowAlert(true);
      }
    }catch (error) {
      console.error('Error creating room:', error)
    } finally {
      setIsLoading(false);
    }
  }

    async function JoinRoom(){
      
      
  }
    
  

  return (
    <section className="min-h-screen bg-[#080605]">
      {showAlert && (
        <Alert 
          message="Room code copied to clipboard!" 
          type="success" 
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
            <Button onClick={CreateRoom} width="w-full" text={isLoading ? "Creating..." : "Create new room"} disabled={isLoading||isJoining}></Button>
            <div className="mt-4 w-full">
              <Input width="w-full" ref={nameRef} placeholder="Enter nickname"></Input>
            </div>
            <div className="flex flex-col sm:flex-row mt-4 w-full gap-4 md:gap-2">
              <Input width="w-full sm:w-4/6" ref={roomRef} placeholder="Enter room code"></Input>
              <Button width="w-full sm:w-2/6" disabled={isLoading||isJoining} onClick={JoinRoom} text={isLoading ? "Joining..." : "JoinRoom"} ></Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Landing
