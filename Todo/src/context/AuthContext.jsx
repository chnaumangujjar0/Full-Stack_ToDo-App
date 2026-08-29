import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../Api/axiosInstance';


const UserContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const res = await api.get('user/current-user');
        console.log("AUTH CONTEXT SUCCESS:", res.data); // <--- ADD THIS
        if (isMounted) setUser(res.data.data); // Check if this should actually be res.data
      } catch (err) {
        console.error("AUTH CONTEXT FAILED:", err); // <--- ADD THIS
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCurrentUser();
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
        {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(UserContext);
};

export default AuthProvider;