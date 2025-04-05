export default function Preview() {
  return (
    <div className="flex mt-16 mb-16  justify-center">
      <div className="flex justify-center w-[1300px]  bg-transparent">
        <video src="/preview2.mp4" autoPlay muted loop playsInline></video>
      </div>
    </div>
  );
}
