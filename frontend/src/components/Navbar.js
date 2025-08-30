import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setShowThemeDropdown(false);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'system': return '💻';
      default: return '💻';
    }
  };

  return (
    <nav className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center text-xl font-bold">
          <span className="mr-2">🎉</span>
          EventHub
        </Link>
        
        <div className="flex space-x-6 items-center">
          <Link to="/" className="hover:underline hover:text-teal-200 transition-colors">Home</Link>
          <Link to="/events" className="hover:underline hover:text-teal-200 transition-colors">Events</Link>
          
          {currentUser ? (
            <>
              <Link to="/create-event" className="hover:underline hover:text-teal-200 transition-colors">Create Event</Link>
              <Link to="/my-events" className="hover:underline hover:text-teal-200 transition-colors">My Events</Link>
              <Link to="/my-rsvps" className="hover:underline hover:text-teal-200 transition-colors">My RSVPs</Link>
              <Link to="/dashboard" className="hover:underline hover:text-teal-200 transition-colors">Dashboard</Link>
              <Link to="/profile" className="hover:underline hover:text-teal-200 transition-colors">Profile</Link>
              
              {/* Theme Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                  className="p-2 rounded-full hover:bg-teal-600 transition-colors"
                  title="Change theme"
                >
                  {getThemeIcon()}
                </button>
                
                {showThemeDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      ☀️ Light Theme
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      🌙 Dark Theme
                    </button>
                    <button
                      onClick={() => handleThemeChange('system')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      💻 System Theme
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-teal-200">Hello, {currentUser.name}</span>
                <button onClick={handleLogout} className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg transition-colors">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline hover:text-teal-200 transition-colors">Login</Link>
              <Link to="/register" className="bg-white text-teal-700 px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;