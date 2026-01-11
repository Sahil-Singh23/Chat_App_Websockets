
const LandingDemo = () => {
  return (
    		<div className="flex flex-col bg-white">
			<div className="flex flex-col items-start self-stretch bg-[#080605] pb-[25px] pl-[98px]">
				<div className="flex flex-col items-start relative pt-[145px] pl-[336px]">
					<div className="flex flex-col items-start py-[30px] pl-[25px] pr-[26px] rounded-2xl border border-solid border-[#444444]">
						<div className="flex items-center mb-[9px] gap-[11px]">
							<img
								src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/5gWrKdI0p1/l07w2fi9_expires_30_days.png"} 
								className="w-10 h-[35px] object-fill"
							/>
							<span className="text-[#FFF6E0] text-2xl font-ntbricksans " >
								{"Anonymous Rooms"}
							</span>
						</div>
						<span className="text-white text-sm mb-5" >
							{"temporary chats that disappears after all users exit"}
						</span>
						<button className="flex items-start bg-neutral-800 text-left py-[18px] px-[13px] mb-[13px] rounded-2xl border-0"
							onClick={()=>alert("Pressed!")}>
							<span className="text-white text-sm mr-[278px]" >
								{"Room Code: 12k12p"}
							</span>
							<span className="text-white text-sm" >
								{"Users: 2"}
							</span>
						</button>
						<div className="w-[515px] h-[457px] mb-2.5 rounded-2xl border border-solid border-[#444444]">
						</div>
						<div className="flex items-start gap-[7px]">
							<div className="w-[410px] h-[54px] rounded-2xl border border-solid border-[#444444]">
							</div>
							<button className="flex flex-col shrink-0 items-start bg-[#FFFAED] text-left py-4 px-7 rounded-2xl border-0"
								onClick={()=>alert("Pressed!")}>
								<span className="text-[#14100B] text-lg" >
									{"Send"}
								</span>
							</button>
						</div>
					</div>
					<img
						src={"https://storage.googleapis.com/tagjs-prod.appspot.com/v1/5gWrKdI0p1/v70s6sdu_expires_30_days.png"} 
						className="w-[735px] h-[361px] absolute top-0 left-0 object-fill"
					/>
				</div>
			</div>
		</div>
  )
}

export default LandingDemo
