import { parseISO, formatDistanceToNow } from "date-fns";
const MessengerProfileBlock = ({user , navigate}) => {
    if (!user) {
        return (
            <div className="flex flex-row flex-1 bg-gray-900 border border-gray-600 p-4 rounded-xl my-2 animate-pulse">
                <div className="rounded-full w-16 h-16 bg-gray-700 mx-2" />
                <div className="px-2 flex flex-col flex-1">
                    <div className="h-6 bg-gray-700 rounded w-1/3 mb-2" />
                    <div className="flex flex-row mt-2">
                        <div className="h-4 bg-gray-700 rounded w-2/3 flex-1 mr-2" />
                        <div className="h-4 bg-gray-700 rounded w-1/4" />
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-row items-center flex-1 bg-gray-900 border border-gray-700 p-4 rounded-xl my-2 hover:shadow-lg transition-shadow duration-200">
            <div
                onClick={() => navigate(`/user/${user.username}`)}
                className="rounded-full w-16 h-16 overflow-hidden ring-2 ring-blue-400 mx-2 cursor-pointer flex-shrink-0"
            >
                <img
                    src={user.profile_pic || "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
            </div>
            <div
                onClick={() => navigate(`/messenger/${user.username}`)}
                className="px-2 flex flex-col overflow-clip cursor-pointer"
            >
                <span className="font-bold text-lg text-white truncate">{user.username}</span>
                
                <div className="mt-1 flex flex-row items-center overflow-clip w-full">
                    {user.last_message && (<><span className="flex-1 text-gray-300 text-sm truncate">
                        {user.from === "you" && <span className="font-semibold text-blue-400">you</span>}
                        {" " + user.last_message}
                    </span>
                    <span className="ml-2 truncate px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-sm whitespace-nowrap">
                        {formatDistanceToNow(parseISO(user.timestamp), { addSuffix: true })}
                    </span></>) }
                </div>
            </div>
        </div>
    );
}
export default MessengerProfileBlock