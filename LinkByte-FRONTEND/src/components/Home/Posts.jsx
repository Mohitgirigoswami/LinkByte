import Post from "./Post";
import Newpost from "./Newpost";
import React, { useEffect, useState } from "react";
const Posts = ({isMobile}) => {
    const [pageNo, setPageNo] = useState(1);
    const getPosts = async () => {
        const response = await fetch(`http://127.0.0.1:5000/getpost/${pageNo}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
            },
                body: JSON.stringify({ page: pageNo }),
            });
            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            if (!data || !data.posts) {
                return [];
            }
            setPosts(prevPosts => [...prevPosts, ...data.posts]);
            return data.posts;
        }
    
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const fetchedPosts = await getPosts();
                setPosts(fetchedPosts);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };
        fetchPosts();
    }, [pageNo]);
    const [posts, setPosts] = useState([]);
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
                    authour={post.author}
                    time={post.time}
                    content={post.content}
                    authour_profile_link={post.authour_profile_link || null}
                    authour_pic_link={post.authour_pic_link}
                />
            ))}
        </div>
    )
}
export default Posts