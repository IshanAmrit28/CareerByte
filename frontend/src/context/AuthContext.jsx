import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as authLogout } from '../services/authServices';
import { useDispatch } from 'react-redux';
import { setUser as setReduxUser } from '../redux/authSlice';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check local storage for an existing session on load
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      dispatch(setReduxUser(storedUser));
    } else {
      dispatch(setReduxUser(null));
    }
    setLoading(false);
  }, [dispatch]);

  const loginUser = (userData) => {
    setUser(userData); // Set user state after successful login
    dispatch(setReduxUser(userData)); // Sync Redux state
  };

  const logoutUser = () => {
    authLogout(); // Clear local storage
    setUser(null); // Clear state
    dispatch(setReduxUser(null)); // Sync Redux state
  };

  const value = {
    user,
    loginUser,
    logoutUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
