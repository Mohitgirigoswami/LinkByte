import Post from "./Post";
import Newpost from "./Newpost";
const Posts = ({isMobile}) => {
    const posts = [
        {
            type: "text",
            authour: "John Doe",
            time: "2 hours ago",
            content: "This is a sample text post to demonstrate the layout.",
            medialink: null,
            authour_profile_link: "https://example.com/johndoe",
            authour_pic_link: "https://randomuser.me/api/portraits/men/1.jpg"
        },
        {
            type: "image",
            authour: "Jane Smith",
            time: "1 hour ago",
            content: "Check out this awesome photo!",
            medialink: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
            authour_profile_link: "https://example.com/janesmith",
            authour_pic_link: "https://randomuser.me/api/portraits/women/2.jpg"
        },
        {
            type: "video",
            authour: "Alex Brown",
            time: "30 minutes ago",
            content: "Here's a cool video I found.",
            medialink: "https://www.w3schools.com/html/mov_bbb.mp4",
            authour_profile_link: "https://example.com/alexbrown",
            authour_pic_link: "https://randomuser.me/api/portraits/men/3.jpg"
        },
        {
            type: "text",
            authour: "Emily White",
            time: "10 minutes ago",
            content: "Loving the new features on this platform!",
            medialink: null,
            authour_profile_link: "https://example.com/emilywhite",
            authour_pic_link: "https://randomuser.me/api/portraits/women/4.jpg"
        },
        {
            type: "image",
            authour: "Chris Green",
            time: "5 minutes ago",
            content: "Nature is beautiful.",
            medialink: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
            authour_profile_link: "https://example.com/chrisgreen",
            authour_pic_link: "https://randomuser.me/api/portraits/men/5.jpg"
        },
        {
            type: "text",
            authour: "Sophia Lee",
            time: "Just now",
            content: "Anyone up for a coding challenge?",
            medialink: null,
            authour_profile_link: "https://example.com/sophialee",
            authour_pic_link: "https://randomuser.me/api/portraits/women/6.jpg"
        },
        {
            type: "image",
            authour: "Mike Johnson",
            time: "Just now",
            content: "Throwback to my last vacation!",
            medialink: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
            authour_profile_link: "https://example.com/mikejohnson",
            authour_pic_link: "https://randomuser.me/api/portraits/men/7.jpg"
        }
    ]




    return (
        <div  className={
            "no-scrollbar overflow-x-hidden overflow-y-auto gap-1 grid grid-cols-1 mt-1 flex-1 mx-1 h-[85vh] md:h-[95vh]"
        }>
            <Newpost
                user_pic_link="https://randomuser.me/api/portraits/men/7.jpg"
            />
            {posts.map((post, index) => (
                <Post
                    key={index}
                    type={post.type}
                    medialink={post.medialink}
                    authour={post.authour}
                    time={post.time}
                    content={post.content}
                    authour_profile_link={post.authour_profile_link}
                    authour_pic_link={post.authour_pic_link}
                />
            ))}
        </div>
    )
}
export default Posts