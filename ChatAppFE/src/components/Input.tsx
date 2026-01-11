type inputProps = {
    placeholder: string,
    width: string
}


const Input = (props: inputProps) => {
  return (
    <div className={`${props.width}`}>
      <input type="text" className="flex flex-col shrink-0 items-center text-left py-4 px-4 rounded-xl border border-solid border-[#444444] w-full text-white"
								placeholder={props.placeholder}>
								
							</input>
    </div>
  )
}

export default Input
