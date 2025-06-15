import Header from "./Header";
import React, { useEffect, useState, useRef, use } from "react";
import Sidemenu from "./Sidemenu";
import Posts from "./Posts";
const Home = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [toggle, settoggle] = useState(true);
  const sideMenuRef = useRef(null);
  const handlemenuclick = () => {
    settoggle(!toggle);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);



  return (
    <div className={"flex flex-wrap " + (isMobile ? "overflow-hidden" : "w-[75vw] mx-auto")}  > 
      <Sidemenu
        isMobile={isMobile}
        classplus={(toggle ? "-translate-x-full" : "translate-x-0")}
        sideMenuRef={sideMenuRef}
        toggle={handlemenuclick}
      />
      <div className="flex flex-col w-screen md:w-[49vw] h-screen">

      <Header
        isMobile={isMobile}
        handlemenuclick={isMobile && handlemenuclick}
      />
      <Posts isMobile={isMobile}/>
        </div></div>
  );
};
export default Home;
