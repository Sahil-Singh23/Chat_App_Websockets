import { useRef } from "react"
import Glow from "./Glow"

interface JoinSharedRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onJoin: (roomCode: string) => void
  isLoading: boolean
}

const JoinSharedRoomModal = ({ isOpen, onClose, onJoin, isLoading }: JoinSharedRoomModalProps) => {
  const modalRoomRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleJoin = () => {
    const roomCode = modalRoomRef.current?.value;
    if (roomCode?.trim()) {
      onJoin(roomCode);
    }
  };

  const handleCancel = () => {
    if (modalRoomRef.current) modalRoomRef.current.value = "";
    onClose();
  };

  return (
    <section className="fixed inset-0 bg-[#080605] flex items-center justify-center z-50 px-3">
      <Glow></Glow>
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-sm w-full">
        <h2 className="text-white text-2xl font-ntbricksans mb-4">Join Shared Room</h2>
        <p className="text-white/70 text-sm mb-6">Enter the room code to join an existing room</p>
        <input
          ref={modalRoomRef}
          type="text"
          placeholder="Enter shared room code"
          className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-2 text-white placeholder-neutral-500 mb-6 focus:outline-none focus:border-neutral-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleJoin();
            }
          }}
          disabled={isLoading}
        />
        <div className="flex gap-3">
          <button
            onClick={handleJoin}
            disabled={isLoading}
            className="flex-1 bg-[#FFFAED] text-black font-semibold py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isLoading ? "Joining..." : "Join Room"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 bg-neutral-800 border border-neutral-600 text-white font-semibold py-2 rounded-lg hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  )
}

export default JoinSharedRoomModal
