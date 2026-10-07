import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('upc_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email, password) => {

    //obtener usuarios registrados
    const users = JSON.parse(localStorage.getItem('upc_registered_users') || '[]');

    //buscar credenciales
    const foundUser = users.find(u => u.email === email && u.password === password);

    //permite tener un usuario admin de prueba
    
    if (email === 'admin@upc.com' && password === 'admin') {
      const adminUser = { email, nombre: 'Administrador', rol: 'admin' };
      setUser(adminUser);
      localStorage.setItem('upc_user', JSON.stringify(adminUser));
      return {success: true};
    }
    if (founduser) {
        const sessinData = {...foundUser};
        delete sessionData.password; // no guarda la password en la sesion activa
        setUser(sessionData);
        localStorage.setItem('upc_user', JSON.stringify(sessionData));
        return {success: true};
    } 
    return {succes: false, message: 'Correo o contraseña incorrectos'};
};
const register = (userData) => {
    const users = JSON.parse(localStorage.getItem('upc_registered_users') || '[]');
    
    const userExists = users.some(u => u.email === userData.email);
    if (userExists) {
      return { success: false, message: 'El correo electrónico ya se encuentra registrado.' };
    }

    users.push(userData);
    localStorage.setItem('upc_registered_users', JSON.stringify(users));

    // Iniciar sesión automáticamente tras registrarse
    const sessionData = { ...userData };
    delete sessionData.password;
    setUser(sessionData);
    localStorage.setItem('upc_user', JSON.stringify(sessionData));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('upc_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);