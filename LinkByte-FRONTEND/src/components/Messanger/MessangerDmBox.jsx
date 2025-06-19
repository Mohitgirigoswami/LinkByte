import { useEffect, useState } from "react";
import MessangerMsg from "./MessangerMsg";
import { useLocation, useNavigate } from "react-router-dom";


const MessangerDmBox = (User) => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(()=>{
    const container = document.querySelector('.Msg-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  },[])

  return (
    <div className="flex flex-col w-screen h-screen">
      <div className="px-5 flex flex-row items-center h-24 w-screen bg-gray-900 border-b-2 text-xl py-5 border-gray-400">
        <svg
          onClick={() => {
            navigate(-1);
          }}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ maxHeight: "100px" }}
        >
          <path d="M19 12H5" />
          <path d="M12 19L5 12L12 5" />
        </svg>
        <div className="flex flex-row bg-gray-900 px-4 rounded-xl items-center w-fill">
          <img
            src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
            alt="Profile"
            className=" object-cover rounded-full w-14 h-14 overflow-hidden ring-1 ring-blue-300 mx-1"
          />
          <span className="font-bold text-2xl px-2">Username</span>
        </div>
        <span className="flex-grow"></span>
      </div>
      <div className="Msg-container h-full w-screen p-9 py-3 overflow-y-auto no-scrollbar">
        <MessangerMsg  sent={0}/>
        <MessangerMsg  sent={1}/>
        <MessangerMsg  />
        <MessangerMsg  sent={1}/>
        <MessangerMsg  sent={1}/>
        <MessangerMsg  />
        <MessangerMsg  />
        <MessangerMsg  sent={1}/>
        <MessangerMsg  sent={1}/>
        <MessangerMsg  />
        <MessangerMsg  />
        <MessangerMsg  />
        <MessangerMsg  sent={1}/>
        <MessangerMsg  sent={1}/>
        <MessangerMsg  />
        <MessangerMsg  />
        <MessangerMsg  />
        <MessangerMsg  sent={1}/>
        <MessangerMsg  sent={1}/>
        <MessangerMsg  />
        <MessangerMsg  sent={1}/>
        <MessangerMsg  sent={1}/>
      </div>
      <div className="inputMsg mx-[5vw] w-[90vw] my-3 flex-1 ring-1 ring-gray-400 px-3 rounded-2xl flex-row flex items-center p-2">
        <textarea
          className="flex-1 h-16 items-center focus:outline-0 py-2 resize-none"
          rows={1}
          style={{ maxHeight: "200px" }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-3 h-8 w-8 cursor-pointer"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </div>
    </div>
  );
};
export default MessangerDmBox;
