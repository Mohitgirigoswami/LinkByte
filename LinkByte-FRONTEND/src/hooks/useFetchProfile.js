// hooks/useFetchProfile.js
import { useState, useCallback } from 'react';

const useFetchProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (username) => {
    setLoading(true);
    setError(null);

    if (!username) {
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/user/${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLoading(false);
        return data;
      } else if (response.status === 404) {
        setLoading(false);
        return { status: 404 };
      } else if (response.status === 422) {
        setLoading(false);
        window.location.href = "./"; 
        return null; 
      } else if (response.status === 500) {
        setLoading(false);
        setError(new Error("Server error (500)"));
        return { status: 500 };
      } else {
        setLoading(false);
        setError(new Error(`Server error: ${response.status}`));
        return null;
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err);
      setLoading(false);
      return null;
    }
  }, []);

  return { fetchProfile, loading, error };
};

export default useFetchProfile;