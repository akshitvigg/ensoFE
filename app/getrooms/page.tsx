"use client";

import { WEB_URL } from "@/config";
import axios from "axios";
import { useEffect, useState } from "react";

export default function getRooms() {
  const [roomsData, setroomsData] = useState<any>([]);
  const [userData, setuserData] = useState<any>([]);

  useEffect(() => {
    async function fetchroom() {
      const res = await axios.get(`${WEB_URL}/rooms`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setroomsData(res.data.rooms);
    }
    fetchroom();

    async function fetchuser() {
      const user = await axios.get(`${WEB_URL}/username`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setuserData(user.data.username);
    }
    fetchuser();
  }, []);

  return (
    <div className=" text-white">
      {roomsData.map((room: any) => (
        <div key={room.id}>
          {room.slug} <br />
          {room.createdAt} <br />
          {room.adminId}
        </div>
      ))}

      <div>
        {userData.map((user: any) => (
          <div key={user.id}>
            {user.email} <br />
            {user.name}
          </div>
        ))}
      </div>
    </div>
  );
}
