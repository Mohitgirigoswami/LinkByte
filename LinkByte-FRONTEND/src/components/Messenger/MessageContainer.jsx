import InfiniteScroll from "react-infinite-scroll-component";
import MessageInput from "./MessageInput";
import MessengerMsg from "./MessengerMsg";
import { useState, useEffect, useRef } from "react";

const MessageContainer = ({ uuid, username, socket }) => {
  const [msgs, setMsgs] = useState([]);
  
  const [hasMore, setHasMore] = useState(true);
  const scrollableDivRef = useRef(null);
  const isInitialLoad = useRef(true);
  const page = useRef(0)
  const BEURL = import.meta.env.VITE_BE_URL;

  const fetchmsgs = async () => {
    try {
      
      const scrollDiv = scrollableDivRef.current;
      const oldScrollHeight = scrollDiv ? scrollDiv.scrollHeight : 0;
      
      page.current = page.current + 1;
      const res = await fetch(`${BEURL}/messages/${username}?page=${page.current}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      data.messages=data.messages
            setMsgs((prev) => [...new Map([...prev.map((msg) => [msg.msg_uuid, msg]), ...data.messages.map((msg) => [msg.msg_uuid, msg])]).values()]);
      if (page.current >= data.total_pages) setHasMore(false);
      

        setTimeout(() => {
        if (!scrollDiv) return;

        if (isInitialLoad.current) {
          scrollDiv.scrollTop = scrollDiv.scrollHeight;
          isInitialLoad.current = false;
        } else {
          const newScrollHeight = scrollDiv.scrollHeight;
          scrollDiv.scrollTop = newScrollHeight - oldScrollHeight + scrollDiv.scrollTop;
        }
      }, 0);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };
useEffect(() => {
  if (!socket) return;
  const handleIncomingMessage = (data) => {
    console.log(data)
    if(data.from==uuid){
    const msg = data.msg;
    console.log("Received:", msg);
    console.log(msgs)
    setMsgs((prev) => [data, ...prev]);}
    console.log(msgs)
  };
  socket.on('error', () => {
    setMsgs((prev) => prev.slice(1));
  });
  socket.on('message', handleIncomingMessage);
  return () => {
    socket.off('error', () => {
    setMsgs((prev) => prev.slice(1));
  });
    socket.off('message', handleIncomingMessage);
  };
  
}, [socket]);


  useEffect(() => {
    setMsgs([]);
    setHasMore(true);
    
    isInitialLoad.current = true;
    if(page.current ===0){
    fetchmsgs();}
  }, [username]);

  return (
    <>
      <div
        id="scrollableDiv"
        ref={scrollableDivRef}
        className="flex-1 no-scrollbar overflow-y-auto flex flex-col-reverse p-4 bg-gray-800"
      >
       <InfiniteScroll
          scrollThreshold={1}
          dataLength={msgs.length}
          next={
            fetchmsgs}
          hasMore={hasMore}
          loader={<p className="text-center text-gray-400">Loading older messages...</p>}
          scrollableTarget="scrollableDiv"
          inverse={true}
          style={{ display: "flex", flexDirection: "column-reverse" }}
        >
          {msgs.map((msg, idx) => (
          
            <MessengerMsg key={idx} msg={msg} />
          ))}
        </InfiniteScroll>

        {msgs.length === 0 && (
          <p className="text-center text-gray-500 mt-4">
            Start chatting with {username}!
          </p>
        )}
      </div>

      <div className="border-t border-gray-700 bg-gray-900">
        <MessageInput setMsgs={(msg)=>setMsgs((p)=>[msg,...p])} updatemsg={(msg)=>setMsgs((p)=>[msg,...p.slice(1)])} socket={socket} uuid={uuid} />
      </div>
    </>
  );
};

export default MessageContainer;
