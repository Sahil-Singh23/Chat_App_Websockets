import ChatIcon from "../icons/ChatIcon"

const Room = () => {
  return (
    <section  className="min-h-screen">
      <div className="flex flex-col bg-white"></div>
      <div className="flex flex-col items-start self-stretch bg-[#080605] pb-6.25 pl-24.5">
        <div className="flex flex-col items-start relative pt-[145px] pl-[336px]">
          <div className="flex flex-col items-start py-[30px] pl-[25px] pr-[26px] rounded-2xl border border-solid border-[#444444]">
            <div className="flex items-center mb-[9px] gap-[11px]">
              <ChatIcon></ChatIcon>
              <span className="text-[#FFF6E0] text-2xl font-ntbricksans " >
								{"Anonymous Rooms"}
							</span>
              
            </div>
            <span className="text-white text-sm mb-5" >
							{"temporary chats that disappears after all users exit"}
						</span>
            <div className="flex items-start bg-neutral-800 text-left py-[18px] px-[13px] mb-[13px] rounded-2xl border-0"
							>
							<span className="text-white text-sm mr-[278px]" >
								{"Room Code: 12k12p"}
							</span>
							<span className="text-white text-sm" >
								{"Users: 2"}
							</span>
						</div>
          </div>
        </div>
      </div>
      
      
    </section>
  )
}

export default Room
