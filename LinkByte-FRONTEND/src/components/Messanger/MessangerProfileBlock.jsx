const MessangerProfileBlock = () => {
    return (
        <div className="flex flex-row flex-1 bg-gray-900 border border-gray-600 p-4 rounded-xl my-2">
            <div className="rounded-full w-16 h-16 overflow-hidden ring-1 ring-blue-300 mx-2">
                <img src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="px-2 flex flex-col flex-1">
                <span className="font-bold text-xl">Username</span>
                <div className="mt-2 flex flex-row">
                    <span className="flex-1">last message</span>
                    
                    <span>timestamp</span>
                </div>
            </div>
        </div>
    );
}
export default MessangerProfileBlock