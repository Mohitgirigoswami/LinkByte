import React, { useEffect, useState } from "react";
import Profile_List_Item from "./Profile_List_Item";

const Profile_List = ({ username,remove_overlay, toggle = true }) => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tgl, setTGL] = useState(toggle);
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response1 = await fetch(
          `http://127.0.0.1:5000/user/${username}/followers`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        );

        if (!response1.ok) throw new Error("Failed to fetch followers");
        const followersData = await response1.json();
        setFollowers(followersData.followers);
        const response2 = await fetch(
          `http://127.0.0.1:5000/user/${username}/following`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        );
        if (!response2.ok) throw new Error("Failed to fetch followers");
        const followingData = await response2.json();
        setFollowing(followingData.following);
      } catch (error) {
        console.error("Error fetching profile lists:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-3 bg-black opacity-80 min-w-[40vh] sm:min-w-[50vh] md:min-w-[60vh] h-[75vh] p-10 rounded-2xl">
      <div className="flex flex-row w-full items-center justify-arround">
        <h3 className="flex-1 text-center text-xl font-bold">Followers</h3>
        <h3 className="flex-1 text-center text-xl font-bold">Following</h3>
        <button
          className="ml-2 p-1 hover:bg-gray-700 rounded-full"
          aria-label="Close"
          onClick={remove_overlay}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6l-12 12"/>
          </svg>
        </button>
      </div>
      <div className="p-3 rounded-xl h-full overflow-y-auto no-scrollbar">
        {tgl &&
          (followers.length === 0 ? (
            <p>No followers found.</p>
          ) : (
            followers.map((user) => (
              <Profile_List_Item key={user.username} user={user} remove_overlay={remove_overlay}/>
            ))
          ))}
        {!tgl &&
          (following.length === 0 ? (
            <p>Not following anyone.</p>
          ) : (
            following.map((user) => (
              <Profile_List_Item key={user.username} user={user} remove_overlay={remove_overlay} />
            ))
          ))}
      </div>
    </div>
  );
};

export default Profile_List;
