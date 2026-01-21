import { useEffect, useRef } from "react"
import Button from "./Button"

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl p-6 shadow-2xl animate-[scale-in_0.2s_ease-out]"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-[#FFF6E0] font-ntbricksans">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="text-white">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
