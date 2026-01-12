type MessageProps = {
    msg:string,
    user: string,
    minutes: number,
    hours: number,
}

const Message = (props: MessageProps) => {
  const formattedTime = `${props.hours.toString().padStart(2, '0')}:${props.minutes.toString().padStart(2, '0')}`;
  
  return (
    <div className="flex flex-col mb-3">
      <span className="text-xs font-sfmono opacity-60 text-white mb-1 ml-1">{props.user}</span>
      <div className="max-w-[70%] w-fit px-4 py-2.5 rounded-2xl bg-neutral-800 border border-neutral-700">
        <p className="text-white text-sm leading-relaxed break-words">{props.msg}</p>
        <span className="text-[10px] font-sfmono opacity-50 text-white mt-1 block text-right">{formattedTime}</span>
      </div>
    </div>
  )
}

export default Message
