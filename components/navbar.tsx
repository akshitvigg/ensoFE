import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      data-aos="fade-down"
      className="backdrop-blur-md bg-zinc-900/80 sticky top-0 z-50 border-b border-zinc-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <img
              src="/enso.png"
              alt="Enso logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <p className="text-2xl font-semibold bg-gradient-to-r from-white to-zinc-400 text-transparent bg-clip-text">
              Enso
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/signin">
              <button className="transition-all hover:cursor-pointer duration-300 active:scale-95 border hover:bg-zinc-800 border-zinc-700 px-4 py-2 rounded-lg text-sm font-medium">
                Sign In
              </button>
            </Link>
            <Link href="/signup">
              <button className="bg-white hover:cursor-pointer transition-all duration-300 active:scale-95 hover:bg-zinc-200 text-black px-4 py-2 rounded-lg text-sm font-medium shadow-md">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
