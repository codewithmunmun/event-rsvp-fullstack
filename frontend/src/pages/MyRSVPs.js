import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyRSVPs = () => {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRSVPs = async () => {
      try {
        const response = await axios.get('/api/rsvps/user');
        setRsvps(response.data);
      } catch (error) {
        console.error('Failed to fetch RSVPs', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRSVPs();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading your RSVPs...</div>;
  }

  const upcomingRSVPs = rsvps.filter(rsvp => new Date(rsvp.date) > new Date());
  const pastRSVPs = rsvps.filter(rsvp => new Date(rsvp.date) <= new Date());

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">My RSVPs</h1>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
        {upcomingRSVPs.length === 0 ? (
          <p className="text-gray-500">You don't have any upcoming events.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingRSVPs.map(rsvp => (
              <div key={rsvp.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {rsvp.image_url && (
                  <img src={rsvp.image_url} alt={rsvp.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{rsvp.title}</h3>
                  <p className="text-gray-600 mb-2">{new Date(rsvp.date).toLocaleDateString()}</p>
                  <p className="text-gray-600 mb-4">{rsvp.location}</p>
                  <div className="flex items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      rsvp.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      rsvp.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {rsvp.status}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">{rsvp.guests_count} guests</span>
                  </div>
                  <Link 
                    to={`/events/${rsvp.event_id}`} 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6">Past Events</h2>
        {pastRSVPs.length === 0 ? (
          <p className="text-gray-500">You don't have any past events.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastRSVPs.map(rsvp => (
              <div key={rsvp.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {rsvp.image_url && (
                  <img src={rsvp.image_url} alt={rsvp.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{rsvp.title}</h3>
                  <p className="text-gray-600 mb-2">{new Date(rsvp.date).toLocaleDateString()}</p>
                  <p className="text-gray-600 mb-4">{rsvp.location}</p>
                  <div className="flex items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      rsvp.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      rsvp.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {rsvp.status}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">{rsvp.guests_count} guests</span>
                  </div>
                  <Link 
                    to={`/events/${rsvp.event_id}`} 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRSVPs;