import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import useCloudinaryUpload from "../../hooks/useCloudinaryUpload";
import useImagePreview from "../../hooks/useImagePreview";

const MessageInput = ({ socket, uuid, setMsgs , updatemsg }) => {
  const [media, setMedia] = useState(null);
  const { file, setFile, previewUrl } = useImagePreview();
  const { uploadFile, isUploading, uploadError, uploadedUrl } =
    useCloudinaryUpload();
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: "image/* video/*",
    noClick: true,
    noKeyboard: true,
    maxSize: 50 * 1024 * 1024,
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setMedia(null);
        setFile(null);
        return null;
      }
      file.type.startsWith("image/") ? setMedia("image") : setMedia("video");
      setFile(file);
    },
  });
  const [msg, setMsg] = useState("");
  const inputRef = useRef();
  const sendMsg = async () => {
    if (inputRef.current) {
      inputRef.current.style.height = "45px";
    }
    if (msg || file) {
      setMsgs({
        from:'you',
        msg: msg,
        type: media || "text",
        url: previewUrl ? previewUrl : null,
        uuid: uuid,
      });
      socket.emit("message", {
        msg: msg,
        type: media || "text",
        url: file ? await uploadFile(file) : null,
        uuid: uuid,
      })
      updatemsg({
        from:'you',
        msg: msg,
        type: media || "text",
        url: file ? await uploadFile(file) : null,
        uuid: uuid,
      });
    }
    setMsg("");
    setMedia(null);
    setFile(null);
  };
  return (
    <>
      <div
        {...getRootProps()}
        className="flex flex-col mx-[5vw] w-[90vw] md:mx-[2vw] md:w-[56vw] "
      >
        {previewUrl && (
          <div className="relative w-32 h-32 mb-2">
            {file && file.type.startsWith("image/") ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <video
                src={previewUrl}
                controls
                className="w-full h-full object-cover rounded-lg"
              />
            )}
            <button
              className="absolute top-1 right-1 bg-gray-800 rounded-full p-1 text-white"
              onClick={() => {
                setMedia(null);
                setFile(null);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        <div className="inputMsg w-[90vw] md:w-[56vw] mb-5 my-3 ring-1 ring-gray-400 px-3 rounded-2xl flex-row flex items-center p-2">
          <textarea
            ref={inputRef}
            className="flex-1 h-11 items-center focus:outline-0 py-2 resize-none"
            rows={1}
            value={msg}
            style={{ maxHeight: "200px" }}
            onInput={(e) => {
              let value = e.target.value;
              let lines = value.split("\n").map((line) => {
                if (line.length <= 40) return line;
                return line.match(/.{1,40}/g).join("\n");
              });
              let newValue = lines.join("\n");
              setMsg(newValue);
              e.target.value = newValue;
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if ((msg && msg.trim() !== "") || file) {
                  sendMsg();
                }
              }
            }}
            placeholder="Type a message..."
          />

          <svg
            onClick={open}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-3 h-8 w-8 cursor-pointer hover:text-blue-500"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
          <input
            type="file"
            name="file"
            {...getInputProps()}
            accept="image/* video/*"
            hidden
            id="filemsg"
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
            className={`ml-3 h-8 w-8`}
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </div>{" "}
      </div>
    </>
  );
};
export default MessageInput;
