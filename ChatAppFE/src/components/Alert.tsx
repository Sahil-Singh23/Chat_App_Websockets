import { useEffect } from 'react'

type AlertProps = {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

const Alert = ({ message, type = 'success', onClose, duration = 2500 }: AlertProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = type === 'success' ? 'bg-[#fff]' : type === 'error' ? 'bg-red-400' : 'bg-white-700'

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-60 animate-slide-down">
      <div className={`${bgColor} text-[#080605] px-6 py-3 rounded-xl shadow-lg flex items-center gap-3`}>
        <span className="font-sfmono text-sm">{message}</span>
        <button 
          onClick={onClose}
          className="text-[#080605] hover:opacity-70 font-bold text-lg"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Alert
