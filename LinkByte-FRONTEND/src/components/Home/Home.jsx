import Header from "./Header";
import React, { useEffect, useState, useRef } from "react";
import Sidemenu from "./Sidemenu";
import Posts from "./Posts";
import Profile from "../Profile/Profile";
import Error404 from "../Error404/Error404";
import { useNavigate } from "react-router-dom";
import Search from "../Profile/Search";

const Home = () => {
  const navigate = useNavigate();
  const [username, setusername] = useState("");
  const [profilelink, setProfileLink] = useState("");
  const [followers, setFollowers] = useState("");
  const [following, setFollowing] = useState("");
  useEffect(() => {
    const jwtToken = localStorage.getItem("jwtToken");

    if (!jwtToken) {
      console.log("No JWT token found. Redirecting to login.");
      localStorage.removeItem("jwtToken");
      navigate("/");
      return;
    }

    fetch("http://127.0.0.1:5000/myinfo", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`, // Use the retrieved token
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
        setusername(data.username || "");
        setProfileLink(data.profile_pic || "");
        setFollowers(data.followers);
        setFollowing(data.following);
      })
      .catch((err) => {
        console.error("Failed to fetch user info:", err);
      });
  }, [navigate]);

  const [is404, setIs404] = useState(false);
  const call_404 = () => {
    setIs404(true);
  };
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [toggle, settoggle] = useState(true);
  const sideMenuRef = useRef(null);
  const handlemenuclick = () => {
    settoggle(!toggle);
  };
  const [overlaycontent, setOverLayContent] = useState(null);

  const remove_overlay = () => {
    setOverLayContent(null);
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

  if (is404) {
    return <Error404 />;
  }

  let mainContent;
  if (window.location.pathname.split("/")[1] === 'user') {
    
      mainContent = (
        <Profile
          setOverLayContent={setOverLayContent}
          remove_overlay={remove_overlay}
          call_404={call_404}
          closemenu={() => settoggle(true)}
        />
      );
      }
    else if (window.location.pathname.split("/")[2] === 'search'){
      mainContent = <Search  onBack={()=>navigate(-1)}/>
    }
    else{
      mainContent = (
        <div className="flex flex-col w-screen md:w-full h-screen">
          <Header
            isMobile={isMobile}
            picLink={profilelink}
            handlemenuclick={isMobile && handlemenuclick}
            username={username}
          />
          <Posts picLink={profilelink} isMobile={isMobile} />
        </div>
      );}
  

  return (
    <>
      {overlaycontent && (
        <div className="flex flex-row items-center fixed justify-center z-20 backdrop-blur-xs h-screen w-screen">
          {overlaycontent}
        </div>
      )}
      <div
        className={
          "flex flex-row " +
          (isMobile ? "overflow-hidden" : "w-[90vw] mx-auto")
        }
      >
        <Sidemenu
          isMobile={isMobile}
          classplus={toggle ? "-translate-x-full" : "translate-x-0"}
          sideMenuRef={sideMenuRef}
          toggle={handlemenuclick}
          username={username}
          profilelink={profilelink}
          followers={followers}
          following={following}
          setOverLayContent={setOverLayContent}
          remove_overlay={remove_overlay}
        />
      
        {mainContent}
      </div>
    </>
  );
};
export default Home;
