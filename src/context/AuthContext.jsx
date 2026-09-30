import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const login = async (email, password) => {
    return { rol: 'admin', email }; 
  };
  const register = async (usuario) => {
    return true;
  };
  return (
    <AuthContext.Provider value={{ login, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);