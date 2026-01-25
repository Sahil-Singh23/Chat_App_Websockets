const TypingBubble = ({ user, isRemoving }: { user: string; isRemoving?: boolean }) => {
  return (
    <div className={`flex items-start gap-3 mb-2 transition-opacity duration-300 ${isRemoving ? 'opacity-0' : 'opacity-100 animate-in fade-in duration-300'}`}>
      <div>
        <p className="text-xs text-white/50 mb-1">{user}</p>
        <div className="bg-neutral-800 px-4 py-3 rounded-2xl max-w-xs flex items-center justify-center min-h-12">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
            <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
            <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingBubble;
