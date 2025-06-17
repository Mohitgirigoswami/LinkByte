import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Error404 from "../Error404/Error404";
import Post from "../Home/Post";
import { useNavigate } from "react-router-dom";
import SkeletonPost from "../Home/Skeltonpost";
import Edit_Profile from "./Edit_Profile";

const Profile = ({ call_404 , setOverLayContent , remove_overlay ,closemenu}) => {

  const { username } = useParams();
  const [isvalid, setIsvalid] = useState(true);
  const [pageno, setPageno] = useState(1);
  const [posts, setPosts] = useState([]);
  const [isself, setIsself] = useState(false);
  const [bio, setBio] = useState("");
  const [isediting, setIsediting] = useState(false);
  const [profile_pic_link, setPiclink] = useState(
    "https://placehold.co/600x600"
  );
  const [profile_bnr_link, setBnrlink] = useState(
    "https://placehold.co/600x600"
  );
  const navigate = useNavigate(); // <-- Get the navigate function here
  const [ispostloading, setispostloading] = useState(true);

  useEffect(() => {
    closemenu()
    if (!username) {
      call_404();
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/user/${username}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsself(data.isself);
          setBio(data.bio || "");
          setPiclink(data.profile_pic || "https://placehold.co/600x400");
          setBnrlink(data.banner_link || "https://placehold.co/600x200");
          setIsvalid(true);
        } else if (response.status === 404) {
          setIsvalid(false);
        } else if (response.status === 450) {
          window.location.href = "./";
        } else if (response.status === 500) {
          setIsvalid(false);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setIsvalid(false);
      }
    };

    fetchProfile();
  }, [username]);

  useEffect(() => {
    const fetchpost = async () => {
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
          setPosts([...posts, ...data.posts]);
          setispostloading(false);
        } else if (response.status === 404) {
          setIsvalid(false);
        } else if (response.status === 450) {
          window.location.href = "./";
        } else if (response.status === 500) {
          setIsvalid(false);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setIsvalid(false);
      }
    };

    fetchpost();
  }, [pageno]);

  if (!isvalid) {
    call_404();
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
                setOverLayContent(<Edit_Profile
          username={username}
          bio={bio}
          profile_pic_link={profile_pic_link}
          back = {remove_overlay}
          banner_link={profile_bnr_link}

      />)
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
            className="left-[10%] top-[40%]  absolute w-[22%] aspect-square rounded-full object-cover border-gray-500 border-[1px] mb-4"
          />
          <div className="pt-12 p-2 w-full">
            <h1 className="mt-1 text-2xl text-white font-bold ">{username}</h1>
            <pre className=" w-full text-gray-300">{bio}</pre>
          </div>
        </div>
        {ispostloading &&
          [...Array(20)].map((_, index) => <SkeletonPost key={index} />)}
        {posts.map((post, index) => (
          <Post
            key={index}
            type={post.type}
            medialink={post.medialink}
            authour={post.author}
            time={post.created_at}
            content={post.content}
            authour_profile_link={post.authour_profile_link || null}
            authour_pic_link={post.authour_pic_link}
          />
        ))}
      </div>
    </>
  );
};

export default Profile;
