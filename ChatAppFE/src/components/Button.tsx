import type { ReactElement } from "react"

type ButtonProps = {
    text?: string,
    onClick: () =>void,
    width: string,
    disabled?: boolean,
    icon?: ReactElement,
    variant?: 'filled' | 'ghost'
}

const Button = (props: ButtonProps) => {
  const isGhost = props.variant === 'ghost';
  const baseClasses = isGhost 
    ? 'border border-neutral-600 text-neutral-300 hover:bg-neutral-900 text-[13px] -m-1'
    : 'bg-[#FFFAED] text-left hover:opacity-90';

  return (
    <div className={`${props.width}`}>
      <button 
        className={`flex flex-col shrink-0 items-center py-3 px-7 rounded-xl border-0 w-full transition-all cursor-pointer ${baseClasses} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={props.onClick}
        disabled={props.disabled}>
        <span className={`  ${isGhost ? '' : 'text-[#14100B] text-lg font-sfmono'}`}>
          {props.text} {props.icon}
        </span>
      </button>
    </div>
  )
}

export default Button
