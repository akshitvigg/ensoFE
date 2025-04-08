"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { WEB_URL } from "@/config";
import Loader from "@/components/loader";

type Choice = "create" | "join";

export default function Dashboard() {
  const [roomsData, setRoomsData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [roomId, setRoomId] = useState("");
  const [choice, setChoice] = useState<Choice | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const roomNameRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");

      try {
        const [roomsRes, userRes] = await Promise.all([
          axios.get(`${WEB_URL}/rooms`, {
            headers: { Authorization: token },
          }),
          axios.get(`${WEB_URL}/username`, {
            headers: { Authorization: token },
          }),
        ]);

        setRoomsData(roomsRes.data.rooms);
        setUserData(userRes.data.username[0]);
      } catch (error) {
        toast.error("Failed to load data");
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (roomId) {
      router.push(`/canvas/${roomId}`);
    }
  }, [roomId, router]);

  async function handleCreateRoom() {
    try {
      setLoading(true);
      const res = await axios.post(
        `${WEB_URL}/createroom`,
        {
          slug: roomNameRef.current?.value,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token") || "",
          },
        }
      );
      setRoomId(res.data.roomid);
      toast.success(`Room ${res.data.roomid} created successfully`);
    } catch (e) {
      toast.warning("Room creation failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleJoinRoom() {
    const slug = roomNameRef.current?.value.trim();
    if (!slug) {
      toast.warning("Enter room id or slug");
      return;
    }
    toast.success(`Joined room ${slug}`);
    router.push(`/canvas/${slug}`);
  }

  function getInitial() {
    return userData?.name?.charAt(0).toUpperCase() || "?";
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col lg:flex-row gap-8 px-4 md:px-8 py-6 font-sans">
      <aside className="w-full lg:w-1/4 bg-[#1c1c1c] p-6 rounded-2xl shadow-md border border-gray-800">
        <div className="flex items-center gap-4 mb-6">
          {userData ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-semibold mb-4">
                {getInitial()}
              </div>

              <div className="w-full space-y-2 text-center">
                <p className="text-xl font-medium">{userData.name}</p>
                <p className="text-gray-400 text-sm">{userData.email}</p>
                <p className="text-xs text-gray-500">
                  ID: {userData.id.slice(0, 8)}...
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="animate-pulse">...</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-gray-800 pt-6">
          <h3 className="font-medium text-lg mb-4">Room Actions</h3>
          {choice ? (
            <div className="space-y-3">
              <input
                ref={roomNameRef}
                type="text"
                placeholder={
                  choice === "create" ? "Enter room name" : "Enter room ID"
                }
                className="w-full rounded-lg border outline-none py-2 px-4 border-neutral-700 bg-[#27272a]"
              />
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    choice === "create" ? handleCreateRoom() : handleJoinRoom()
                  }
                  className="flex-1 h-10 flex items-center justify-center transition-all active:scale-95 duration-200 border-[#262626] border rounded-lg hover:bg-[#262626] bg-[#18181b]"
                >
                  {loading ? (
                    <Loader />
                  ) : choice === "create" ? (
                    "Create"
                  ) : (
                    "Join"
                  )}
                </button>
                <button
                  onClick={() => setChoice(null)}
                  className="px-4 h-10 flex items-center justify-center transition-all active:scale-95 duration-200 border-[#262626] border rounded-lg hover:bg-[#262626] bg-[#18181b]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => setChoice("create")}
                className="w-full transition-all duration-200 text-md py-2 border-[#262626] border rounded-lg hover:bg-[#262626] bg-[#18181b]"
              >
                Create Room
              </button>
              <button
                onClick={() => setChoice("join")}
                className="w-full transition-all duration-200 text-md py-2 border-[#262626] border rounded-lg hover:bg-[#262626] bg-[#18181b]"
              >
                Join Room
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 bg-[#1c1c1c] p-6 rounded-2xl shadow-md border border-gray-800">
        <h2 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2">
          Your Rooms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomsData
            .filter((room) => room.adminId === userData?.id)
            .map((room) => (
              <div
                key={room.id}
                className="bg-[#2a2a2a] hover:bg-[#333] transition-all duration-200 p-4 rounded-xl border border-gray-700 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <p className="text-lg font-medium text-white mb-1">
                    {room.slug}
                  </p>
                  <p className="text-sm text-gray-400">
                    Created: {new Date(room.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Room ID: {room.id}</p>
                </div>
                <button
                  onClick={() => router.push(`/canvas/${room.id}`)}
                  className="mt-4 px-4 py-2 text-sm bg-[#18181b] border border-[#262626] rounded-lg hover:bg-[#262626] transition-all"
                >
                  Join
                </button>
              </div>
            ))}
        </div>
        {(!roomsData.length ||
          roomsData.filter((room) => room.adminId === userData?.id).length ===
            0) && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <p className="text-center mb-2">No rooms created yet</p>
            <p className="text-sm text-gray-600">
              Create a room to get started
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
