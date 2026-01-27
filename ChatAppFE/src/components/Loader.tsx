const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-neutral-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-[#FFFAED] rounded-full animate-spin"></div>
      </div>
      <p className="text-white/70 text-sm font-sfmono">Connecting to room...</p>
    </div>
  );
};

export default Loader;