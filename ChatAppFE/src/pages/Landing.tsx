import Button from "../components/Button"
import Input from "../components/Input"
import ChatIcon from "../icons/ChatIcon"

const Landing = () => {
  return (
    <section className="min-h-screen bg-[#080605]">
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
            <Button onClick={()=>{}} width="w-full" text="Create new room"></Button>
            <div className="mt-4 w-full">
              <Input width="w-full" placeholder="Enter nickname"></Input>
            </div>
            <div className="flex flex-col sm:flex-row mt-4 w-full gap-2">
              <Input width="w-full sm:w-4/6" placeholder="Enter room code"></Input>
              <Button width="w-full sm:w-2/6" onClick={()=>{}} text="Join Room"></Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Landing
