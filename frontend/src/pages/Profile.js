import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading profile...</div>;
  }

  if (!userData) {
    return <div className="min-h-screen flex items-center justify-center text-white">Failed to load profile</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-blue-900 to-purple-900 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-white">Your Profile</h1>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
            <div className="flex-shrink-0">
              <img
                src={userData.profile_picture || '/default-avatar.png'}
                alt="Profile"
                className="w-48 h-48 rounded-full object-cover border-4 border-teal-300/50 shadow-lg"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-teal-300 mb-2">{userData.name}</h2>
              <p className="text-teal-100 mb-4">{userData.email}</p>
              
              {userData.bio && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-emerald-300 mb-2">Bio</h3>
                  <p className="text-gray-200 leading-relaxed">{userData.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {userData.phone && (
                  <div>
                    <h3 className="text-sm font-semibold text-cyan-300 mb-1">Phone</h3>
                    <p className="text-gray-200">{userData.phone}</p>
                  </div>
                )}
                
                {userData.address && (
                  <div>
                    <h3 className="text-sm font-semibold text-cyan-300 mb-1">Address</h3>
                    <p className="text-gray-200">{userData.address}</p>
                  </div>
                )}
              </div>

              <Link
                to="/edit-profile"
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-lg inline-block"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-teal-300 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200">
              <div>
                <span className="text-teal-200 font-medium">Member since:</span>{' '}
                {new Date(userData.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="text-teal-200 font-medium">Role:</span> {userData.role || 'User'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;