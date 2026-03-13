import { io } from "socket.io-client";

const socket = io("https://capstone-backend-kiax.onrender.com", {
  transports: ["websocket", "polling"],
  autoConnect: true,
});

export default socket;