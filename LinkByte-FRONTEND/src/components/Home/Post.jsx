import { useNavigate } from "react-router-dom";
import {parseISO,formatDistanceToNow} from 'date-fns';
const Post = ({
  type,
  medialink,
  authour,
  time,
  content,
  authour_profile_link,
  authour_pic_link,
}) => {
  const navigate = useNavigate(); // <-- Get the navigate function here
   const dateObj = parseISO(time);
   const relativeTime = formatDistanceToNow(dateObj, { addSuffix: true });
  const handleImageClick = () => {
    navigate(`/user/${authour}`); // <-- Use the navigate function
  }
  return (
        <div className="p-2.5 rounded-xl h-fit flex-1 flex flex-row bg-gray-900">
          <img
            className="w-10 h-10 rounded-full mr-1"
            src={authour_pic_link}
            alt="profile pic"
            onClick={handleImageClick}
          />
          <div className="px-1 flex flex-col flex-1">
            <div className="flex flex-row">
              <p className="text-gray-100 font-bold">{authour}</p>
              <p className="flex-grow"></p>
              <p className="text-gray-400 text-sm">{relativeTime}</p>
            </div>
            <div  className="flex-1">
              {medialink && type === "video" &&
              <video
                className="w-full h-auto rounded-lg mt-2"
                controls
                autoPlay
                muted
                loop                
                src={medialink}
              ></video>}
              {medialink && type === "image" &&
              <img
                className="flex-1 h-auto rounded-lg mt-2"
                src={medialink}
                alt="post media"/>}
              <p className="text-wrap text-gray-200">{content}</p>
            </div>
          </div>
        </div>)
};
export default Post;
