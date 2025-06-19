import { useNavigate } from "react-router-dom";
import SkeletonPost from "../Home/Skeltonpost";
import MessangerProfileBlock from "./MessangerProfileBlock";

const MessangerList = () => {
  const navigate = useNavigate();
  return (
    <div className="p-3 w-screen h-screen flex-col flex bg-gray-900">
      <div className="px-5 flex flex-row items-center h-16 flex-1 bg-gray-900 border-b-2 text-xl py-5 border-gray-400">
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
        >
          <path d="M19 12H5" />
          <path d="M12 19L5 12L12 5" />
        </svg>
        <span className="font-bold pl-5 text-xl hover:bg-gray-400 hover:text-black">
          username
        </span>
        <span className="flex-grow"></span>
      </div>
      <div className="h-[95vh]  overflow-y-auto no-scrollbar">
        <MessangerProfileBlock/>
        <MessangerProfileBlock/>
        <MessangerProfileBlock/>
        <MessangerProfileBlock/>
        <MessangerProfileBlock/>
        <MessangerProfileBlock/>
        <MessangerProfileBlock/>
        <MessangerProfileBlock/>
        <MessangerProfileBlock/>
        <MessangerProfileBlock/>
      </div>
    </div>
  );
};
export default MessangerList;
