import Link from "next/link";

export default function Navbar() {
  return (
    <div className=" bg-zinc-900 flex justify-between ">
      <div className=" flex items-center space-x-2  ml-4">
        <img src="/enso.png" alt="ensologo" width={30} />
        <p className=" text-2xl py-4 ">Enso</p>
      </div>
      <div className=" m-4  space-x-3">
        <Link href={"/signin"}>
          <button className=" transition-all duration-300 active:scale-85 border hover:bg-zinc-800 hover:cursor-pointer  border-zinc-600 px-3 py-2 rounded-md">
            Sign In
          </button>
        </Link>
        <Link href={"/signup"}>
          <button className=" bg-white  transition-all duration-300 active:scale-85 hover:bg-zinc-300 hover:cursor-pointer text-black py-2 px-3 rounded-md ">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}
