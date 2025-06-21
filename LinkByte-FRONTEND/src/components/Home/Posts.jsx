import Post from "./Post";
import Newpost from "./Newpost";
import React, { useEffect, useState ,useRef} from "react";
import SkeletonPost from "./Skeltonpost";
const Posts = ({isMobile ,picLink}) => {
    const [posts, setPosts] = useState([]);
    const divref = useRef(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [pageNo, setPageNo] = useState(1);
    const getPosts = async () => {
        const response = await fetch(`http://127.0.0.1:5000/getposts/${pageNo}`, {
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
            setIsLoading(false);
            if (data.posts.length < 10) {
                setHasMore(false);
            }
            return data.posts;
        }
    
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const fetchedPosts = await getPosts();
                setPosts((prevPosts) => {
  const existingpost_uuids = new Set(prevPosts.map(post => post.post_uuid)); // Create a Set of IDs for quick lookup

  const uniqueFetchedPosts = fetchedPosts.filter(post => !existingpost_uuids.has(post.post_uuid)); // Filter out duplicates

  return [...prevPosts, ...uniqueFetchedPosts]; // Append only the unique new posts
});
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };
        fetchPosts();
    }, [pageNo]);






    
    return (
        <div
        onScroll={(e) => {
            console.log(e.target.scrollHeight-e.target.scrollTop)
            if(e.target.scrollHeight-e.target.scrollTop <= 2000){
            if (hasMore && !isLoading) {
                setIsLoading(true);
                console.log(pageNo)
                setPageNo(pageNo + 1);
            }
        }}}
        ref={divref}
        className={"no-scrollbar overflow-x-hidden overflow-y-auto gap-1 grid grid-cols-1 mt-1 flex-1 mx-1 h-[85vh] md:h-[95vh]"}>
            <Newpost
                user_pic_link={picLink}
            />
            {posts.map((post, index) => (
                <Post
                    key={index}
                    post={post}
                    />
            ))}
            {!posts.length &&  [...Array(20)].map((_, index) => (
                <SkeletonPost key={index} /> 
            ))}
        </div>
    )
}
export default Posts