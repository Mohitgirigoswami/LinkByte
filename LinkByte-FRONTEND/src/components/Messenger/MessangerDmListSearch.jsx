import { useState, useRef, useEffect } from "react";

const MessengerDmListSearch = ({setResults ,setSearchquery,setLoading,searchquery}) => {
  const timeoutRef = useRef(null);
  const fetchUsers = async () => {
    if (!searchquery.trim()) {
      setResults([]);
      return;
    }

    try {
      const response1 = await fetch(
        `http://127.0.0.1:5000/search/user/${searchquery.trim()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );

      if (!response1.ok) {
        setLoading(false)
        throw new Error(
          `Failed to fetch Users: ${response1.status} ${response1.statusText}`
        );
      }
        setLoading(false)
      const userSearch = await response1.json();
      setResults(userSearch.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      setResults([]);
    }
  };

  useEffect(() => {
    setLoading(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (searchquery.trim()) {
      timeoutRef.current = setTimeout(fetchUsers, 400);
    } else {
      setResults([]);
    }

    return () => {
        setLoading(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchquery.trim()]);

  return (
      <div className="my-2 bg-blue-800 text-white rounded-xl flex flex-row items-center justify-center px-2 h-16 border-2 border-white">
        <input
          value={searchquery}
          onInput={(e) => {
            setSearchquery(e.target.value);
          }}
          name="DmListSearchBar"
          placeholder="Enter username to search"
          type="text"
          className="flex-1 w-full text-center focus:outline-0 text-xl"
        />
        <svg
          className="fill-gray-800 h-5 w-5"
          onClick={() => {
            setSearchquery("");
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M697.4 759.2l61.8-61.8L573.8 512l185.4-185.4-61.8-61.8L512 450.2 326.6 264.8l-61.8 61.8L450.2 512 264.8 697.4l61.8 61.8L512 573.8z" />
        </svg>
      </div>
  );
};

export default MessengerDmListSearch;
