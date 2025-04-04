export default function Footer() {
  return (
    <div className="py-8 bg-zinc-800">
      <div className=" flex items-center space-x-2    ml-4">
        <img src="/enso.png" alt="ensologo" width={30} />
        <p className=" text-2xl ">Enso</p>
      </div>
      <p className=" ml-5 mt-1 text-zinc-400">
        Real time collaborative drawing
      </p>
    </div>
  );
}
