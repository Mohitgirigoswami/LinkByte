import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Error404 from "../Error404/Error404";
import Post from "../Home/Post";
import { useNavigate } from "react-router-dom";
import SkeletonPost from "../Home/Skeltonpost";
import Edit_Profile from "./Edit_Profile";
import Profile_List from "./Profile_List";
import useFetchProfile from '../../hooks/useFetchProfile';

const Profile = ({ call_404, setOverLayContent, remove_overlay, closemenu }) => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [isvalid, setIsvalid] = useState(true);
  const [isself, setIsself] = useState(false);
  const [bio, setBio] = useState("");
  const [followers, setFollowers] = useState(0); // Initialize with number
  const [following, setFollowing] = useState(0); // Initialize with number
  const [followed, setFollowed] = useState(false);
  const [profile_pic_link, setPiclink] = useState("https://placehold.co/600x600");
  const [profile_bnr_link, setBnrlink] = useState("https://placehold.co/600x600");

  const [pageno, setPageno] = useState(1);
  const [posts, setPosts] = useState([]);
  const [ispostloading, setispostloading] = useState(true);

  const { fetchProfile, loading: profileLoading, error: profileError } = useFetchProfile();

  useEffect(() => {
    closemenu();

    const loadProfileData = async () => {
      if (!username) {
        call_404();
        setIsvalid(false);
        return;
      }

      const data = await fetchProfile(username);

      if (data) {
        
        if (data.status === 404 || data.status === 500) {
          setIsvalid(false);
        } else if (data.status === 450) {
           setIsvalid(false); // Consider it invalid if redirected
        }
        else {
          setIsself(data.isself);
          setBio(data.bio || "");
          setFollowers(data.followers);
          setFollowing(data.following);
          setPiclink(data.profile_pic || "https://placehold.co/600x400");
          setBnrlink(data.banner_link || "https://placehold.co/600x200");
          setFollowed(data.followed);
          setIsvalid(true);
        }
      } else if (profileError) {
        console.error("Error fetching profile in component:", profileError);
        setIsvalid(false);
      } else {
        setIsvalid(false);
      }
    };

    loadProfileData();
  }, [username, closemenu, call_404, fetchProfile, profileError]); // Add fetchProfile and profileError to dependencies

  useEffect(() => {
    if (!isvalid || profileLoading) {
        setispostloading(false); // Stop post loading if profile is invalid or still loading
        return;
    }

    const fetchPosts = async () => {
      setispostloading(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/user/${username}/post/${pageno}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPosts((prevPosts) => [...prevPosts, ...data.posts]); // Append new posts
        } else if (response.status === 404) {
          // No more posts to load, but profile might still be valid
          console.log("No more posts found for this user.");
        } else if (response.status === 450) {
          window.location.href = "./";
        } else if (response.status === 500) {
          console.error("Server error fetching posts (500)");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setispostloading(false);
      }
    };

    fetchPosts();
  }, [pageno, username, isvalid, profileLoading]); 

  const handleFollow = async () => {
    const prevIsfollowed = followed;
    const prevfollowers = followers;
    const newFollowed = !followed; // Toggle boolean
    const newfollowers = followed ? followers - 1 : followers + 1;
    setFollowed(newFollowed);
    setFollowers(newfollowers);

    try {
      const response = await fetch(`http://localhost:5000/follow/${username}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify({
          message: newFollowed ? 'follow' : 'unfollow', // Send correct action
        })
      });
      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }
    } catch (error) {
      // Revert UI changes if request fails
      setFollowed(prevIsfollowed);
      setFollowers(prevfollowers);
      console.error(error);
    }
  };

  if (profileLoading) {
    return (
      <div className="overflow-y-auto no-scrollbar md:h-[99vh] h-screen w-screen bg-gray-900 md:mt-[1vh] md:mx-[0.4vw] md:w-[49vw] flex flex-col items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="overflow-y-auto no-scrollbar md:h-[99vh] h-screen w-screen bg-gray-900 md:mt-[1vh] md:mx-[0.4vw] md:w-[49vw] flex flex-col items-center justify-center text-white">
        Error loading profile: {profileError.message}
      </div>
    );
  }

  if (!isvalid) {
    // If the profile data indicates it's not valid after the fetch
    return <Error404 />; // Render your 404 component
  }

  return (
    <>
      <div className="overflow-y-auto no-scrollbar md:h-[99vh] h-screen w-screen bg-gray-900 md:mt-[1vh] md:mx-[0.4vw] md:w-[49vw]">
        <div className="pl-5 flex flex-row items-center z-10 fixed flex-1 h-12 bg-gray-900 w-screen md:w-[49vw]">
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
          {isself && (
            <button
              onClick={() => {
                setOverLayContent(
                  <Edit_Profile
                    username={username}
                    bio={bio}
                    profile_pic_link={profile_pic_link}
                    back={remove_overlay}
                    banner_link={profile_bnr_link}
                  />
                );
              }}
              className="p-1 px-5 mr-5 font-semibold rounded-xl ring-1 ring-gray-400 hover:bg-white hover:text-black transition-colors duration-200"
            >
              Edit
            </button>
          )}
        </div>
        <div className="mt-12 flex flex-col items-center p-1.5 sm:p-4 relative">
          <img
            className="object-cover w-full aspect-3/1 border-b-[1px] border-b-gray-400"
            src={profile_bnr_link}
            alt="banner"
          />
          <img
            src={profile_pic_link}
            alt="Profile"
            className="left-[10%] top-[11vh] sm:top-[10vh] md:top-[20vh]  absolute w-[22%] aspect-square rounded-full object-cover border-gray-500 border-[1px] mb-4"
          />
          <div className="pt-12 p-5 rounded-2xl w-full">
            <div className="flex flex-row items-center">
              <h1 className="mt-1 text-2xl text-white font-bold ">{username}</h1>
              <span className="flex-grow"></span>
              {!isself && (
                <button
                  onClick={handleFollow}
                  className={`text-base font-semibold px-6 py-2 rounded-full transition-colors duration-200 border-2 ${
                    followed
                      ? "bg-white text-gray-900 border-white hover:bg-gray-200"
                      : "bg-transparent text-white border-white hover:bg-white hover:text-gray-900"
                  } shadow-md focus:outline-none`}
                >
                  {followed ? "Following" : "Follow"}
                </button>
              )}
            </div>
            <div className="flex flex-row flex-1 mt-2">
              <span onClick={() => {
                setOverLayContent(<Profile_List
                  remove_overlay={remove_overlay}
                  username={username}
                  isFollowers={true} // Pass a prop to distinguish followers/following
                  />)
              }} className="cursor-pointer">
                {followers} followers
              </span>
              <span className="flex-grow"></span>
              <span onClick={() => {
                setOverLayContent(<Profile_List
                  remove_overlay={remove_overlay}
                  toggle={false} // This was the original prop, consider renaming for clarity
                  username={username}
                  isFollowers={false} // Pass a prop to distinguish followers/following
                  />)
              }} className="cursor-pointer">
                {following} following
              </span>
              <span className="flex-3"></span>
            </div>
            <pre className="max-h-36 min-h-12 pt-5 overflow-clip w-full text-gray-300">{bio}</pre>
          </div>
        </div>
        {ispostloading &&
          [...Array(3)].map((_, index) => <SkeletonPost key={index} />)} 
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </>
  );
};

export default Profile;