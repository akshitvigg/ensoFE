export default function Preview() {
  return (
    <div className="relative w-full overflow-hidden bg-zinc-950 rounded-lg">
      <video
        src="/preview.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="w-full object-cover rounded-lg"
      ></video>
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-20"></div>
    </div>
  );
}
