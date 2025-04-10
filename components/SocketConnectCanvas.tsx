"use client";

import { useEffect, useState } from "react";
import { Canvas } from "./realcanvas";
import { WS_URL } from "@/config";
import Loader from "./loader";

export function SocketCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=${localStorage.getItem("token")}`
    );

    ws.onopen = () => {
      setSocket(ws);
      const data = JSON.stringify({
        type: "join_room",
        roomId,
      });
      ws.send(data);
    };
  }, []);

  if (!socket) {
    return (
      <div className=" flex justify-center h-screen items-center">
        <Loader size={50} />
      </div>
    );
  }

  return (
    <div className=" flex justify-center">
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
