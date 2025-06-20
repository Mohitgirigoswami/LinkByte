import { useState, useEffect } from "react";
import MessengerList from "./MessengerList";
import { useLocation } from "react-router-dom";
import MessengerDmBox from "./MessengerDmBox";
import { io } from "socket.io-client";
const Messenger = () => {
  const [ischatting, setIsChatting] = useState(false);
  const [username, setUsername] = useState("");
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    setIsChatting(!!pathParts[2]);
  }, [location.pathname]);
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    fetch("http://127.0.0.1:5000/myinfo", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Use the retrieved token
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 401) {
          console.log("JWT token expired or invalid. Redirecting to login.");
          localStorage.removeItem("jwtToken");
          navigate("/");
          return Promise.reject("Unauthorized or expired token");
        }
        if (!res.ok) {
          return Promise.reject(`Server error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setUsername(data.username || "");
      })
      .catch((err) => {
        console.error("Failed to fetch user info:", err);
      });
  }, []);
  const [socket, setSocket] = useState();

  useEffect(() => {
    const newSocket = io("http://127.0.0.1:8000", {
      auth: {
        token: localStorage.getItem("jwtToken"),
      },
      transports: ["websocket"],
      reconnectionDelay: 1500,
    });

    setSocket(newSocket);

    return () => {
      console.log("Disconnecting socket from Messenger component cleanup.");
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-row">
      <div className={`${ischatting && "hidden"} md:block md:w-[40vw]`}>
        <MessengerList username={username} />
      </div>
      {ischatting ? (
        <div className="z-10 w-[60vw]">
          {socket ? (
            <MessengerDmBox socket={socket} />
          ) : (
            <div className="flex justify-center items-center h-screen text-white">
              Establishing real-time connection...
            </div>
          )}
        </div>
      ) : <div className=" hidden justify-center md:flex items-center w-[60vw] border-l text-4xl border-gray-100 bg-gray-900">
          <span className="animate-bounce"> Start Chating</span>
      </div> }
    </div>
  );
};
export default Messenger;
