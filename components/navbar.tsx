export default function Navbar() {
  return (
    <div className=" bg-zinc-800 flex justify-between ">
      <div className=" flex items-center space-x-2  ml-4">
        <img src="/enso.png" alt="ensologo" width={30} />
        <p className=" text-2xl py-4 ">Enso</p>
      </div>
      <div className=" m-4  space-x-3">
        <button className=" border border-zinc-600 px-3 py-2 rounded-md">
          Sign In
        </button>
        <button className=" bg-white text-black py-2 px-3 rounded-md ">
          Sign Up
        </button>
      </div>
    </div>
  );
}
