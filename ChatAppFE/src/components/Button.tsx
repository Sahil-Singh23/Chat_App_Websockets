type ButtonProps = {
    text: string,
    onClick: () =>void,
    width: string,
    disabled?: boolean,
}

const Button = (props: ButtonProps) => {
  return (
    <div className={`${props.width}`}>
      <button 
        className={`flex flex-col shrink-0 items-center bg-[#FFFAED] text-left py-3 px-7 rounded-xl border-0 w-full transition-opacity ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
        onClick={props.onClick}
        disabled={props.disabled}>
        <span className="text-[#14100B] font-sfmono text-lg" >
          {props.text}
        </span>
      </button>
    </div>
  )
}

export default Button
