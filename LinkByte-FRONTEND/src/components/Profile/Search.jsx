import React, { useEffect, useState, useRef } from "react";
import Profile_List_Item from "./Profile_List_Item";
import Post from "../Home/Post";
import SkeletonPost from "../Home/Skeltonpost";

const Search = ({ toggle = true, onBack }) => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tgl, setTGL] = useState(toggle);

  const debounceTimeoutRef = useRef(null);

  const fetchSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) {
      setUsers([]);
      setPosts([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      const response1 = await fetch(
        `${import.meta.env.VITE_BE_URL}/search/user/${searchQuery}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );

      if (!response1.ok) throw new Error("Failed to fetch Users");
      const userSearch = await response1.json();
      setUsers(userSearch.users);

      const response2 = await fetch(
        `${import.meta.env.VITE_BE_URL}/search/post/${searchQuery}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );
      if (!response2.ok) throw new Error("Failed to fetch Posts");
      const postSearch = await response2.json();
      setPosts(postSearch.posts);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchSearch();
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Back button handler
  const handleBack = () => {
    // window.history.back();
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="no-scrollbar flex-col md:h-[99vh] flex h-screen w-screen bg-gray-900 md:mt-[1vh] md:mx-[0.4vw] md:w-[49vw]">
      <div className="flex items-center p-4">
        <button
          onClick={handleBack}
          className="mr-2 w-fit px-2 py-2 rounded bg-gray-800 text-white hover:bg-gray-600 focus:outline-none"
          aria-label="Back"
        >
          &#8592; Back
        </button>
        
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search users or posts..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value.trimStart());
            setLoading(true);
          }}
        />
      </div>
      <div className="grid grid-cols-2 border-b-2 border-gray-500 pb-3 mx-2">
        <button
          type="button"
          className={`flex-grow font-bold text-xl mx-1 text-center rounded-2xl transition ease-in-out duration-200 ${
            tgl ? " ring-2 ring-gray-200" : "hover:ring-2 hover:ring-gray-600"
          }`}
          onClick={() => setTGL(true)}
        >
          Users
        </button>
        <button
          type="button"
          className={`flex-grow font-bold text-xl mx-1 text-center rounded-2xl transition ease-in-out duration-200 ${
            !tgl ? " ring-2 ring-gray-200" : "hover:ring-2 hover:ring-gray-600"
          }`}
          onClick={() => setTGL(false)}
        >
          Posts
        </button>
      </div>
      <div className="overflow-y-auto p-5 flex-1 ">
        {loading ? (
          <SkeletonPost />
        ) : tgl ? (
          users.length === 0 ? (
            <p>No user found.</p>
          ) : (
            users.map((user) => (
              <Profile_List_Item key={user.username} user={user} />
            ))
          )
        ) : posts.length === 0 ? (
          <p>No Posts found.</p>
        ) : (
          posts.map((post) => <Post key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default Search;