import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    eventsCreated: 0,
    eventsAttending: 0,
    totalRSVPs: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, rsvpsRes] = await Promise.all([
        axios.get('/api/events/user/events'),
        axios.get('/api/rsvps/user')
      ]);

      const eventsCreated = eventsRes.data.length;
      const eventsAttending = rsvpsRes.data.filter(rsvp => rsvp.status === 'confirmed').length;

      setStats({
        eventsCreated,
        eventsAttending,
        totalRSVPs: rsvpsRes.data.length
      });

      setRecentEvents(eventsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-purple-600">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-2xl font-bold text-purple-600">{stats.eventsCreated}</h3>
            <p className="text-gray-600">Events Created</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-2xl font-bold text-green-600">{stats.eventsAttending}</h3>
            <p className="text-gray-600">Events Attending</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-2xl font-bold text-blue-600">{stats.totalRSVPs}</h3>
            <p className="text-gray-600">Total RSVPs</p>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-purple-600">Your Recent Events</h2>
          {recentEvents.length === 0 ? (
            <p className="text-gray-600">You haven't created any events yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {recentEvents.map(event => (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-gray-600">{event.location}</p>
                  <p className="text-sm text-gray-500">{event.rsvp_count} attendees</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4 text-purple-600">Quick Actions</h2>
          <div className="flex space-x-4">
            <button className="btn-primary">Create New Event</button>
            <button className="btn-secondary">View All Events</button>
            <button className="btn-secondary">Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;