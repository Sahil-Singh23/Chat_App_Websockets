import { useState } from "react"
import Modal from "./Modal"
import Button from "./Button"

type ShareLinkModalProps = {
  isOpen: boolean
  onClose: () => void
  roomLink: string
}

const ShareLinkModal = ({ isOpen, onClose, roomLink }: ShareLinkModalProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Room Link">
      <div className="space-y-4">
        <p className="text-sm text-white/70 font-sfmono">
          Share this link with others to invite them to the room
        </p>
        
        <div className="flex items-center gap-2 p-3 bg-neutral-800 rounded-xl border border-neutral-700">
          <input
            type="text"
            value={roomLink}
            readOnly
            className="flex-1 bg-transparent text-white text-sm font-sfmono outline-none"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            width="w-full" 
            text={copied ? "Copied!" : "Copy Link"} 
            onClick={handleCopy}
          />
          <Button 
            width="w-24" 
            text="Close" 
            onClick={onClose}
          />
        </div>
      </div>
    </Modal>
  )
}

export default ShareLinkModal
