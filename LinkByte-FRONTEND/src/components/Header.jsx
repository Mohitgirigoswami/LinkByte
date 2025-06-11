import React, { useState, useRef, useContext } from "react";
import Menu from "./Menu";
const Header = ({ isMob }) => {
  console.log(isMob)
  const [headers, setheaders] = useState(["For You", "Following"]);
  const hedref = useRef([]);
  const [ismenuopen,setismenuopen] = useState(false)
  const handleprofileclick = () => {
    if (isMob) {
      console.log('detected');
      setismenuopen(!ismenuopen);
    }
  };
  
  return (
    <div className={"flex " + (isMob?"":"mx-[5vw]")}>
      <Menu isMob={isMob} isOn={!isMob||ismenuopen} onClose={handleprofileclick}/>
      <div className="w-screen h-fit bg-gray-950 grid grid-cols-1">
        <div className="p-5 justify-between flex flex-row">
          <img
            onClick={handleprofileclick}
            className="rounded-full w-10 h-10"
            src="https://placehold.co/150x150/png"
            alt="profile-pic"
          />
          <img className="w-10 h-10" src="./logo.png" alt="logo" />
          <a>Logout</a>
        </div>
        <nav className="flex flex-row overflow-auto justify-around">
          {headers.map((Val, idx) => (
            <span
              ref={(el) => {
                hedref.current[idx] = el;
              }}
              className="p-3 font-bold"
              key={idx}
            >
              {Val}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
};
export default Header;
