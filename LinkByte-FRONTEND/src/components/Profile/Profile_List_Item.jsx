import { useNavigate } from "react-router-dom";
const Profile_List_Item = ({ user ,  remove_overlay}) => {
    const navigate = useNavigate();
    return (
        <div className="profile-list-item flex items-center p-2 border-b"

        onClick={()=>{
            remove_overlay()
            navigate(`/user/${user.username}`)}}
        >
            <img
                src={user.profile_pic || "/default-avatar.png"}
                alt={user.username}
                className="w-10 h-10 rounded-full mr-3"
            />
            <div className="flex-1">
                <div className="font-semibold">{user.username}</div>
                <div className="text-sm text-gray-500">@{user.username}</div>
            </div>
        </div>
    )
}

export default Profile_List_Item;