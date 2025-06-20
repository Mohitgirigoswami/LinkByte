// MessengerList.jsx
import { useNavigate } from "react-router-dom";
import MessengerDmListSearch from "./MessangerDmListSearch";
import MessengerProfileBlock from "./MessengerProfileBlock";
import { useEffect, useState } from "react";
import axios from "axios";

const MessengerList = ({ username }) => {
  const [searchquery, setSearchquery] = useState("");
  const [searchloading, setsearchLoading] = useState(false);
  const [searchresults, setResults] = useState([]);
  const [users, setUsers] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    axios
      .get("http://127.0.0.1:5000/user_to_show_dm", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setUsers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const navigate = useNavigate();

  const displayList = searchquery.trim() !== "" ? searchresults : users;
  const isListEmpty = !displayList || displayList.length === 0;

  return (
    <div className="p-3 w-screen h-screen flex-col flex bg-gray-900 md:w-full">
      <div className="px-5 h-screen flex flex-row items-center h-16 flex-1 bg-gray-900 border-b-2 text-xl py-5 border-gray-400 md:border-0">
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
          {username}
        </span>
        <span className="flex-grow"></span>
      </div>
      <div className="h-[95vh] overflow-y-auto no-scrollbar">
        <MessengerDmListSearch
          setResults={setResults}
          setSearchquery={setSearchquery}
          setLoading={setsearchLoading}
          searchquery={searchquery}
        />

        {loading ? (
          <>
            <MessengerProfileBlock />
            <MessengerProfileBlock />
            <MessengerProfileBlock />
            <MessengerProfileBlock />
            <MessengerProfileBlock />
            <MessengerProfileBlock />
            <MessengerProfileBlock />
          </>
        ) : searchquery.trim() !== "" && searchloading ? (
          <p className="text-white text-center mt-4">Searching...</p>
        ) : isListEmpty ? (
          <p className="text-white text-center mt-4">
            {searchquery.trim() !== "" ? "No search results found." : "No users to display."}
          </p>
        ) : (
          displayList.map((user, index) => (
            <MessengerProfileBlock
              key={user.id || index}
              user={user}
              navigate={navigate}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MessengerList;