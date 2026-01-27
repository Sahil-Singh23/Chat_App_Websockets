import React from "react";
interface ShareLinkModalProps {
  isOpen: boolean;
  roomCode: string;
  onClose: () => void;
  onCopy: () => void;
}

const ShareLinkModal = ({ isOpen, roomCode, onClose, onCopy }: ShareLinkModalProps) => {
  const shareLinkRef = React.useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (shareLinkRef.current) {
      shareLinkRef.current.select();
      document.execCommand('copy');
      onCopy();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-3 z-50">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-sm w-full">
        <h2 className="text-white text-xl font-ntbricksans mb-4">Share Room Link</h2>
        <p className="text-white/70 text-sm mb-4">Copy this link and share it with others:</p>
        <div className="bg-neutral-800 border border-neutral-600 rounded-lg p-3 mb-4 flex items-center gap-2">
          <input
            ref={shareLinkRef}
            type="text"
            readOnly
            value={`${window.location.origin}/room/${roomCode}`}
            className="flex-1 bg-transparent text-white text-xs outline-none select-all"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-[#FFFAED] text-black text-xs font-semibold rounded hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Copy
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-white border border-neutral-600 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShareLinkModal;