const MessengerMsg = ({ msg }) => {
    return (
        <div className={`w-full flex mb-2 ${(msg.from != 'you') ? "flex-row-reverse" : "flex-row"}`}>
            <div className="min-w-[20%]"></div>
            <div className="flex-grow flex flex-col">
                {msg.type=="image" &&
                <img className={`max-h-96 p-[1px] rounded-sm object-contain ${(msg.from=="you")
                            ? "bg-blue-500 text-gray-900 ml-auto rounded-br-none"
                            : "bg-gray-900 text-gray-900 mr-auto rounded-bl-none"
                        }`} src={msg.url} alt="image" />}
                {msg.type=="video"  &&
                <video className={`max-h-96 p-[1px] rounded-sm object-contain ${(msg.from=="you")
                            ? "bg-blue-500 text-gray-900 ml-auto rounded-br-none"
                            : "bg-gray-900 text-gray-900 mr-auto rounded-bl-none"
                        }`} src={msg.url} controls />}
                {msg.msg && <div
                    className={`
                        max-w-[70%] px-4 py-2 rounded-lg shadow
                        ${(msg.from=="you")
                            ? "bg-blue-500 text-white ml-auto rounded-br-none"
                            : "bg-gray-200 text-gray-900 mr-auto rounded-bl-none"
                        }
                        break-words
                        overflow-x-auto
                        whitespace-pre-wrap
                        overflow-y-auto
                    `}
                    style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                >
                    {msg.msg }
                </div>}
            </div>
        </div>
    );
};

export default MessengerMsg;