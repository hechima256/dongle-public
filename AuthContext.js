import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
const AuthContext = createContext();

export function useAuthContext() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState('');
    const [loading, setLoading] = useState(true);
      
    const value = {
        user, loading,
    };
    useEffect(() => {
        const unsubscribed = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser('');
            }
            setLoading(false);
        });
        return () => unsubscribed();
    }, []);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

