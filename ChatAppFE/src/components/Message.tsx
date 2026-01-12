type MessageProps = {
    msg:string,
    user: string,
    minutes: number,
    hours: number,
}

const Message = (props: MessageProps) => {
  return (
    <div className="max-w-1/2 p-2 m-1 h-auto text-white rounded-xl bg-slate-900 flex flex-col">
        <div className="text-sm">{props.user} : {props.msg}</div>
        <div className="text-xs">{props.hours}:{props.minutes}</div>
    </div>
  )
}

export default Message
