import Preview from "@/components/ensopreview";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black font-[family-name:var(--font-geist-sans)]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-white to-zinc-400 text-transparent bg-clip-text tracking-tight">
            Welcome to Enso
          </h1>
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            Create or join virtual whiteboards to draw, plan and brainstorm with
            your team in real-time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10 sm:mt-12">
          <Link href="/signup">
            <button className="w-full sm:w-auto transition-all hover:bg-white hover:bg-opacity-90 duration-300 active:scale-95 bg-white text-black font-medium py-3 px-8 rounded-lg text-lg shadow-lg shadow-white/10">
              Get Started
            </button>
          </Link>
          <Link href="/signin">
            <button className="w-full sm:w-auto py-3 px-8 hover:bg-zinc-800 transition-all duration-300 active:scale-95 rounded-lg text-lg font-medium border border-zinc-700 hover:border-zinc-600 shadow-lg shadow-black/20">
              I already have an account
            </button>
          </Link>
        </div>
      </div>

      <div className="relative mt-10 mb-20">
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="p-6 bg-gradient-to-r from-purple-800/20 via-blue-800/20 to-purple-800/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-900/20">
            <div className="relative rounded-xl overflow-hidden border-2 border-white/20 shadow-inner">
              <Preview />

              <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-white/30 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-white/30 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-white/30 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-white/30 rounded-br-lg"></div>
            </div>
          </div>

          <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-900 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-900 rounded-full opacity-10 blur-3xl"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-zinc-700/50 hover:border-zinc-600/50 transition-all">
            <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Real-time Collaboration
            </h3>
            <p className="text-zinc-400">
              Work together with your team in real-time on the same canvas.
            </p>
          </div>

          <div className="p-6 bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-zinc-700/50 hover:border-zinc-600/50 transition-all">
            <div className="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Intuitive Drawing Tools
            </h3>
            <p className="text-zinc-400">
              Express your ideas with our easy-to-use drawing and design tools.
            </p>
          </div>

          <div className="p-6 bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-zinc-700/50 hover:border-zinc-600/50 transition-all">
            <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Save & Share</h3>
            <p className="text-zinc-400">
              Save your work and share it with others with a simple link.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to start collaborating?
        </h2>
        <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
          Join thousands of teams who use Enso to bring their ideas to life.
        </p>
        <Link href="/signup">
          <button className="transition-all hover:bg-white hover:bg-opacity-90 duration-300 active:scale-95 bg-white text-black font-medium py-3 px-8 rounded-lg text-lg">
            Create your free account
          </button>
        </Link>
      </div>

      <Footer />
    </div>
  );
}
