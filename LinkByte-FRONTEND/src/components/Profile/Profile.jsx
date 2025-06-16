import { useState, useEffect } from 'react';

const Profile = () => {
    const [content, setContent] = useState(null);
    const username = window.location.pathname.split('/')[2];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/profile/${username}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                    },
                    body: JSON.stringify({
                        message: 'need user info'
                    }),
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setContent(<User userinfo={data.user} is_self={data.is_self}/>);
                } else if (response.status === 404) {
                    setContent(<No_user />);
                } else if (response.status === 450) {
                    alert('you need to login again');
                    setContent(<Auth />);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    }, [username]);

    return content;
};

export default Profile;
