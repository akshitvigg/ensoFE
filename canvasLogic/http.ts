import { WEB_URL } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
  // First get the base shapes from chat history
  const res = await axios.get(`${WEB_URL}/chats/${roomId}`, {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  });

  const messages = res.data.messages;
  let shapes = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData.shape;
  });

  // Then get shape movements
  try {
    const movementsRes = await axios.get(
      `${WEB_URL}/shapeMovements/${roomId}`,
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );

    const movements = movementsRes.data.movements;

    // Apply movements to shapes
    if (movements && movements.length > 0) {
      movements.forEach((movement: any) => {
        const shapeIndex = movement.shapeIndex;
        if (shapes[shapeIndex]) {
          shapes[shapeIndex] = JSON.parse(movement.shapeData);
        }
      });
    }
  } catch (error) {
    console.error("Error fetching shape movements:", error);
    // Continue with just the base shapes if movements can't be fetched
  }

  return shapes;
}
