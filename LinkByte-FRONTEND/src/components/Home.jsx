import Header from "./Header";
import { useState, useEffect } from "react";
const Home = () => {
  const [isMob, setisMob] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => {
      setisMob(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });
  return (
    <>
      <Header isMob={isMob}  />
    </>
  );
};
export default Home;
