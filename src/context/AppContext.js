import React, { createContext, useContext, useState, useEffect } from 'react';
import { initDB, seedAccounts } from '../db/database';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [dbReady, setDbReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    initDB()
      .then(() => seedAccounts())
      .then(() => setDbReady(true))
      .catch(err => console.error('DB init error:', err));

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{ dbReady, user, setUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);