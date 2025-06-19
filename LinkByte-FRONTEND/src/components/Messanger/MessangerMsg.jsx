const MessangerMsg = ({ sent, text }) => {
    return (
        <div className={`w-full flex mb-2 ${sent ? "flex-row-reverse" : "flex-row"}`}>
            <div className="min-w-[20%]"></div>
            <div className="flex-grow flex">
                <div
                    className={`
                        max-w-[70%] px-4 py-2 rounded-lg shadow
                        ${!sent
                            ? "bg-blue-500 text-white ml-auto rounded-br-none"
                            : "bg-gray-200 text-gray-900 mr-auto rounded-bl-none"
                        }
                        break-words
                    `}
                >
                    {text || "hello how are you"}
                </div>
            </div>
        </div>
    );
};

export default MessangerMsg;