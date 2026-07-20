import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../Api/axiosInstance';


const UserContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/user/current-user');
        
        setUser(res.data.data); 
      } catch (err) {
        console.error("Failed to fetch user on reload:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);
  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      
      
      {loading ? (
        <div className="h-screen w-screen flex items-center justify-center bg-[#F4F5F7]">
          <h1 className="text-xl font-bold text-[#045D4B]">Loading...</h1>
        </div>
      ) : (
        children
      )}
      
    </UserContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(UserContext);
};

export default AuthProvider;