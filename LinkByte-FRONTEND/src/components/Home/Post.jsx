import { useNavigate } from "react-router-dom";
import { parseISO, formatDistanceToNow } from "date-fns";
import { useState } from "react";
const Post = ({ post }) => {
  const type = post.type;
  const medialink = post.medialink;
  const authour = post.author;
  const time = post.created_at;
  const content = post.content;
  const authour_pic_link = post.authour_pic_link;
  const [likes ,setLikes ]= useState(post.total_reactions);
  const [isliked, setIsliked] = useState(post.current_user_reaction);

  const navigate = useNavigate(); // <-- Get the navigate function here
  const dateObj = parseISO(time);
  const relativeTime = formatDistanceToNow(dateObj, { addSuffix: true });
  const handleImageClick = () => {
    navigate(`/user/${authour}`); // <-- Use the navigate function
  };
  const handleLike = async () => {
    // Optimistically update UI
    const prevIsLiked = isliked;
    const prevLikes = likes;
    const newIsLiked = isliked ? null : 'liked';
    const newLikes = isliked ? likes - 1 : likes + 1;
    setIsliked(newIsLiked);
    setLikes(newLikes);

    try {
      const response = await fetch(`${import.meta.env.VITE_BE_URL}/like/${post.post_uuid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify({
          reaction: 'Like',
        })
      });
      if (!response.ok) {
        throw new Error("Failed to like post");
      }
    } catch (error) {
      // Revert UI changes if request fails
      setIsliked(prevIsLiked);
      setLikes(prevLikes);
      console.error(error);
    }
  };

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
        <div className="flex-1 ">
          <pre className="text-wrap text-gray-300 font-sans text-xl ">{content}</pre>
          {medialink && type === "video" && (
            <video
              className="ring-1 ring-gray-600 w-full h-auto rounded-lg mt-2"
              controls
              autoPlay
              muted
              loop
              src={medialink}
            ></video>
          )}
          {medialink && type === "image" && (
            <img
              className="ring-1 ring-gray-600 flex-1 max-h-96 rounded-lg mt-2"
              src={medialink}
              alt="post media"
            />
          )}
        </div>
        <div
          onClick={handleLike}
          className={`flex flex-grow flex-row p-2 text-2xl items-center transition-all ease-in-out${isliked && "text-pink-600"} hover:text-pink-600`}
        >
          <svg
            className={"transition-all ease-in hover:cursor-pointer "+(isliked && "fill-pink-600 stroke-pink-600")}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span className="mx-2">{likes || 0}</span>
        </div>
      </div>
    </div>
  );
};
export default Post;
