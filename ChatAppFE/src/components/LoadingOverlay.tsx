interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay = ({ isLoading }: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-3 z-50">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-neutral-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-[#FFFAED] rounded-full animate-spin"></div>
          </div>
          <p className="text-white/70 text-sm font-sfmono">Connecting to room...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;