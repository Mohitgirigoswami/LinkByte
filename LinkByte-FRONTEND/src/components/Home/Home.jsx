import Header from "./Header";
import React, { useEffect, useState, useRef, use } from "react";
import Sidemenu from "./Sidemenu";
const Home = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [toggle, settoggle] = useState(true);
  const sideMenuRef = useRef(null);
  const handlemenuclick = () => {
    settoggle(!toggle);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);



  return (
    <div className={(isMobile) ? "overflow-hidden" : "w-[75vw] mx-auto flex"}  > 
      <Sidemenu
        isMobile={isMobile}
        classplus={(toggle ? "-translate-x-full" : "translate-x-0")}
        sideMenuRef={sideMenuRef}
        toggle={handlemenuclick}
      />
      <Header
        isMobile={isMobile}
        handlemenuclick={isMobile && handlemenuclick}
      />
      
      </div>
  );
};
export default Home;
