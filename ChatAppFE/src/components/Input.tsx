import { forwardRef } from "react"

type inputProps = {
    placeholder: string,
    width: string,
}


const Input = forwardRef<HTMLInputElement, inputProps>((props, ref) => {
  return (
    <div className={`${props.width}`}>
      <input 
        ref={ref}
        type="text" 
        className="flex flex-col shrink-0 items-center text-left py-3 px-4 rounded-xl border border-solid border-[#444444] w-full text-white bg-transparent focus:outline-none focus:border-[#C7AF6B]"
        placeholder={props.placeholder}
      />
    </div>
  )
})

Input.displayName = 'Input'

export default Input
