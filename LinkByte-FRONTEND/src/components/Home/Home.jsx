import Header from "./Header";
import React, { useEffect, useState, useRef, use } from "react";
import Sidemenu from "./Sidemenu";
import Posts from "./Posts";
import Profile from "../Profile/Profile";
import Error404 from "../Error404/Error404";
const Home = () => {
  const [username, setusername] = useState("");
  const [is404,setIs404] = useState(false)
  const call_404 = () => {
    setIs404(true);
  }
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

  if (is404){
    return <Error404 />
  }

  return (
    <div
      className={
        "flex flex-wrap " + (isMobile ? "overflow-hidden" : "w-[75vw] mx-auto")
      }
    >
      <Sidemenu
        isMobile={isMobile}
        classplus={toggle ? "-translate-x-full" : "translate-x-0"}
        sideMenuRef={sideMenuRef}
        toggle={handlemenuclick}
      />
      {(window.location.pathname.split("/")[1] == "user") ? (
        <Profile call_404={call_404} />
      ) : (
        <div className="flex flex-col w-screen md:w-[49vw] h-screen">
          <Header
            isMobile={isMobile}
            handlemenuclick={isMobile && handlemenuclick}
          />
          <Posts isMobile={isMobile} />
        </div>
      )}
    </div>
  );
};
export default Home;
