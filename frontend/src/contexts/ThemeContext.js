import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Detect system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme('system');
      applyTheme(systemTheme);
    }
  }, []);

  useEffect(() => {
    if (theme !== 'system') {
      applyTheme(theme);
      localStorage.setItem('theme', theme);
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyTheme(systemTheme);
      localStorage.setItem('theme', 'system');
    }
  }, [theme]);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #0fa3b1 0%, #2a9d8f 50%, #1a535c 100%)');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)');
    }
  };

  const value = {
    theme,
    setTheme,
    toggleTheme: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};