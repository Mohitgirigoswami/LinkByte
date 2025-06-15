import React, { useState } from "react";
const Header = ({ isMobile , handlemenuclick }) => {
  return (
    <>
      {isMobile && (
        <div className="h-[10vh] bg-gray-950 border-b-2 border-gray-800 flex items-center justify-around text-gray-100">
          <svg
            onClick={handlemenuclick}
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 cursor-pointer"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>

          <img className="w-12 h-12" src="./logo.png" alt="logo" />
          <img
            className="rounded-full w-12 h-12"
            src="https://placehold.co/64X64/ffffff/000000/png"
            alt=""
          />
        </div>
      )}
      <div className={"overflow-auto h-[4vh] bg-gray-900 flex flex-row rounded-xs"}>
        <span className="h-[80%] mx-2 my-auto p-2 px-4 ring-gray-700 ring-2 rounded-sm min-w-fit w-full text-gray-50 font-bold flex items-center justify-center">
          For you
        </span>
        <span className="h-[80%] mx-2 my-auto p-2 px-4 ring-gray-700 ring-2 rounded-sm min-w-fit w-full text-gray-50 font-bold flex items-center justify-center">
          Following
        </span>
      </div>
    </>
  );
};
export default Header;
