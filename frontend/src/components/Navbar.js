import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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