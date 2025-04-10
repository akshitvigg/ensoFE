"use client";
import { WEB_URL } from "@/config";
import axios from "axios";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import Loader from "./loader";

export default function AuthComp({ isSignup }: { isSignup: boolean }) {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function signup() {
    const email = emailInputRef.current?.value;
    const password = passInputRef.current?.value;
    const name = nameInputRef.current?.value;

    try {
      setLoading(true);
      const res = await axios.post(`${WEB_URL}/signup`, {
        email,
        password,
        name,
      });

      console.log(res.data);

      toast.success("You have successfully signed up!");
      router.push("/signin");
    } catch (e) {
      console.log(e);
      toast.warning("Signup failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  }
  async function signin() {
    const email = emailInputRef.current?.value;
    const password = passInputRef.current?.value;

    try {
      setLoading(true);
      const res = await axios.post(`${WEB_URL}/signin`, {
        email,
        password,
      });

      toast.success("You have successfully signed in!");
      localStorage.setItem("token", res.data.token);
      router.push("/roomsdashboard");
    } catch (e) {
      console.log(e);
      toast.warning("Signin failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="  h-screen items-center justify-center flex">
      <div className="  sm:w-[384px] w-[354px] border rounded-xl border-neutral-800">
        <div className=" flex justify-center">
          <div>
            {/* email */}
            <p className=" text-2xl flex justify-center mt-8 font-bold">
              Welcome to Enso
            </p>
            <div className=" mt-6  flex justify-center">
              <div>
                <label className=" font-semibold text-sm" htmlFor="email">
                  Email
                </label>
                <br />
                <input
                  id="email"
                  className=" mt-1 rounded-lg border outline-none  py-2 px-10 border-neutral-700 bg-[#27272a]"
                  ref={emailInputRef}
                  placeholder="demo@example.com"
                />
              </div>
            </div>
            {/* pass */}
            <div className=" mt-2 flex justify-center">
              <div>
                <label className=" font-semibold text-sm" htmlFor="pass">
                  Password
                </label>
                <br />
                <input
                  id="pass"
                  className=" mt-1 rounded-lg border outline-none  py-2 px-10 border-neutral-700 bg-[#27272a]"
                  ref={passInputRef}
                  placeholder="password"
                />
              </div>
            </div>
            {/* name */}
            {isSignup && (
              <div className="mt-2 flex justify-center">
                <div>
                  <label className="font-semibold text-sm" htmlFor="name">
                    Name
                  </label>
                  <br />
                  <input
                    id="name"
                    className="border mt-1  rounded-lg outline-none py-2 px-10 border-neutral-700 bg-[#27272a]"
                    ref={nameInputRef}
                    placeholder="Sakamoto Taro"
                  />
                </div>
              </div>
            )}
            {/* btn */}
            <div className=" pb-7 flex justify-center">
              <button
                className=" transition-all duration-200 active:scale-95 text-md mt-7 h-[45px] w-[290px]  border-[#262626] border  rounded-lg hover:bg-[#262626]  bg-[#18181b] text-white"
                onClick={() => {
                  const email = emailInputRef.current?.value.trim();
                  const pass = passInputRef.current?.value.trim();
                  const name = nameInputRef.current?.value.trim();

                  if (!email || !pass || (isSignup && !name)) {
                    toast.warning("Please fill out all the required fields");
                    return;
                  }
                  isSignup ? signup() : signin();
                }}
              >
                {loading ? <Loader /> : isSignup ? "Sign Up" : "Sign In"}
              </button>
            </div>
            <p className="  pb-8 text-center">
              {isSignup ? " Already a member?" : " Haven't registered yet?"}
              <a
                className=" text-zinc-400"
                href={isSignup ? "/signin" : "/signup"}
              >
                {isSignup ? " Sign In" : " Sign Up"}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
