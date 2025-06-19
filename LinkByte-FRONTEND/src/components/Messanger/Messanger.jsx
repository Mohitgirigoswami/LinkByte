import { useState } from "react";
import MessangerList from "./MessangerList";
import { useLocation } from "react-router-dom";
import MessangerDmBox from "./MessangerDmBox";
const Messanger = () => {
  const [ischatting, setIsChatting] = useState(false);
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  if (pathParts[2]) {
    setIsChatting(true);
  }
  return (
    <div>
      <MessangerList />
      {ischatting && (
        <div className="z-10">
          <MessangerDmBox />
        </div>
      )}
    </div>
  );
};
export default Messanger;
