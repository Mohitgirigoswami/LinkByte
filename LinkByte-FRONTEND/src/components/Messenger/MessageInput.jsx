import { useState , useRef} from "react";
const MessageInput =({socket,uuid , setMsgs}) => {
    const [msg,setMsg]=useState("");
    const inputRef = useRef()
    const sendMsg = () => {
      if (inputRef.current) {
        inputRef.current.style.height = "45px";
      }
      
      if(msg){
        setMsgs({msg:msg , from:"you"})
      socket.emit('message',msg,uuid);}
      setMsg("")
    }
    return <div className="inputMsg mx-[5vw] w-[90vw] md:mx-[2vw] md:w-[56vw] mb-5 my-3 ring-1 ring-gray-400 px-3 rounded-2xl flex-row flex items-center p-2">
      <textarea
      ref={inputRef}
        className="flex-1 h-11 items-center focus:outline-0 py-2 resize-none"
        rows={1}
        value={msg}
        style={{ maxHeight: "200px" }}
        onInput={(e) => {
        let value = e.target.value;
        let lines = value.split('\n').map(line => {
          if (line.length <= 40) return line;
          return line.match(/.{1,40}/g).join('\n');
        });
        let newValue = lines.join('\n');
        setMsg(newValue);
        e.target.value = newValue;
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
        }}
        onKeyDown={(e)=>{
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (msg && msg.trim() !== "") {
          sendMsg();
          }
        }
        }}
        placeholder="Type a message..."
      />

      <svg
      onClick={sendMsg}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`ml-3 h-8 w-8 ${
        1 ? "cursor-pointer" : "cursor-not-allowed opacity-50"
        }`}>
        <path d="M22 2L11 13" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
      </svg>
      </div>
    
}
export default MessageInput