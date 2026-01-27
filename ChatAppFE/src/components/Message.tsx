import Sending from "../icons/Sending"
import Sent from "../icons/Sent"

type MessageProps = {
    msg:string,
    user: string,
    minutes: number,
    hours: number,
    isSelf: boolean,
    status?: 'sending' | 'sent'
}

const Message = (props: MessageProps) => {
  const formattedTime = `${props.hours.toString().padStart(2, '0')}:${props.minutes.toString().padStart(2, '0')}`;
  
  return (
    <div className={`flex flex-col mb-3 ${props.isSelf ? 'items-end' : 'items-start'}`}>
      <span className="text-xs font-sfmono opacity-60 text-white mb-1 ml-1">{props.user}</span>
      <div className={`max-w-[70%] w-fit px-4 py-2.5 rounded-2xl border border-neutral-700 ${
        props.isSelf ? 'bg-neutral-900' : 'bg-neutral-800'
      }`}>
        <p className="text-white text-sm leading-relaxed break-words">{props.msg}</p>
        <div className="flex items-center justify-end gap-1.5 mt-1">
          <span className="text-[10px] font-sfmono opacity-50 text-white">{formattedTime}</span>
          {props.isSelf && props.status && (
            props.status === 'sending' ? <Sending /> : <Sent />
          )}
        </div>
      </div>
    </div>
  )
}

export default Message
