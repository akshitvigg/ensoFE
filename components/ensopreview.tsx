export default function Preview() {
  return (
    <div className="relative w-full overflow-hidden bg-zinc-950">
      <video
        src="/preview.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="w-full object-cover"
      ></video>

      <div className="absolute inset-0 bg-gradient-to-tr from-purple-800/5 via-transparent to-blue-800/5"></div>
    </div>
  );
}
