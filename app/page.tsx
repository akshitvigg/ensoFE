import Preview from "@/components/ensopreview";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { ToastContainer } from "react-toastify";

export default function Home() {
  return (
    <div className=" min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Navbar />

      <p className=" text-5xl font-bold text-center mt-24">Welcome to Enso</p>
      <div className=" flex justify-center">
        <p className=" text-2xl  text-center mt-10 w-[700px] text-zinc-500">
          Create or join virtual whiteboards to draw, plan and brainstorm with
          your team in real-time.
        </p>
      </div>

      <div className=" flex space-x-6 justify-center mt-16">
        <Link href={"/signup"}>
          <button className="  transition-all  hover:bg-zinc-300 duration-300 active:scale-95 bg-white hover:cursor-pointer text-black py-3 px-4 rounded-md text-xl">
            Get Started
          </button>
        </Link>
        <Link href={"/signin"}>
          <button className="py-3 hover:bg-zinc-800  transition-all duration-300 active:scale-95 px-4 rounded-md text-xl hover:cursor-pointer border border-zinc-800">
            I already have an account
          </button>
        </Link>
      </div>

      <Preview />
      <Footer />
    </div>
  );
}
