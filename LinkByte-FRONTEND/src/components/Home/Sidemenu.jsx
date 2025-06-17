import React from "react";
import { useNavigate } from "react-router-dom";
const Sidemenu = ({
  classplus,
  isMobile,
  sideMenuRef,
  toggle,
  username,
  profilelink
}) => {
  const navigate = useNavigate();
  return (
    <div
      ref={sideMenuRef}
      className={
        "flex flex-col items-start justify-start w-64 h-screen bg-gray-900 text-gray-100 p-4 space-y-4 transition-all duration-300 ease-in-out " +
        classplus +
        (isMobile
          ? " absolute top-0 left-0 z-50 rounded-r-2xl"
          : " rounded-l-2xl translate-x-0 max-w-[25vw]")
      }
    >
      <div className="m-[5%] grid grid-cols-1 w-[90%] pb-5  border-b-2 border-gray-500">
        <div className=" flex flex-row">
          <img
            src={profilelink || "https://placehold.co/600x600"}
            onClick={() => {
              navigate(`../user/${username}`);
            }}
            alt="profile pic"
            className="rounded-full ring-1 ring-blue-400 w-28 aspect-square"
          />
          {isMobile && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-auto abosolute top-2 right-2 cursor-pointer"
              onClick={toggle}
            >
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          )}
        </div>
        <p>{username} </p>
        <p className="text-gray-400 -mt-1 ">hello world</p>
        <div className="flex flexrow text-xs">
          <span>0 Followers</span>
          <div className="flex-grow"></div>
          <span>0 Following</span>
          <div className="flex-grow"></div>
        </div>
      </div>

      <div className="flex items-center w-full space-x-2 cursor-pointer hover:bg-gray-700 p-2 rounded-md">
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
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 11 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <p>Settings</p>
      </div>
      <div className="flex items-center w-full space-x-2 cursor-pointer hover:bg-gray-700 p-2 rounded-md">
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
        >
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
          <line x1="12" y1="6" x2="12" y2="12" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
        <p>Help</p>
      </div>
      <div className="flex items-center w-full space-x-2 cursor-pointer hover:bg-gray-700 p-2 rounded-md">
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
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <p>Logout</p>
      </div>
    </div>
  );
};
export default Sidemenu;
