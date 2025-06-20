import { useEffect, useRef, useState, useCallback } from "react";
import Error404 from "../Error404/Error404";
import { useLocation, useNavigate } from "react-router-dom";
import useFetchProfile from "../../hooks/useFetchProfile";
import MessageContainer from "./MessageContainer";
const MessengerDmBox = ({ socket }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathParts = location.pathname.split("/");
  const targetUsername = pathParts[2];
  const [profile_pic, setProfile_pic] = useState(null); 
  const [uuid, setUuid] = useState(null);

  const { fetchProfile, loading, error } = useFetchProfile();

  useEffect(() => {
    if (!targetUsername) {
      return;
    }

    const getProfile = async () => {
      try {
        const profileData = await fetchProfile(targetUsername);
        if (profileData) {
          setProfile_pic(profileData.profile_pic);
          setUuid(profileData.uuid);
        } else { 
          console.warn("Profile not found for username:", targetUsername);
          setUuid(null);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setUuid(null); 
      }
    };

    getProfile();
  }, [targetUsername, fetchProfile]);
  if (!targetUsername) {
    return <Error404 message="No username specified in the URL." />;
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-blue-500" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
        </svg></div>
    );
  }
  if (error || !uuid) {
    return <Error404 message="Could not find user or an error occurred." />;
  }

  return (
    <div className="flex w-screen flex-col h-screen md:w-[60vw]"> 
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-200 shadow-sm">
        <button
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
          onClick={() => navigate('/messenger')} // Use useNavigate to go back
        >
          <svg className="w-6 h-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18L9 12L15 6"></path>
          </svg>
        </button>

        <div className="flex items-center flex-grow ml-4">
          <img
            src={profile_pic || 'https://via.placeholder.com/400X400'} // Fallback to a placeholder image
            alt={`${targetUsername}'s Profile Picture`}
            className="w-10 h-10 rounded-full object-cover border border-gray-300"
          />
          <span className="ml-3 text-lg font-semibold text-gray-100">
            {targetUsername}
          </span>
        </div>
      </div>
    
      
      <MessageContainer uuid = {uuid} username={targetUsername} socket={socket}/>
    </div>
  );
};

export default MessengerDmBox;