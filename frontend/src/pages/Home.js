import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        setEvents(response.data.slice(0, 3)); // Show only 3 featured events
      } catch (error) {
        console.error('Failed to fetch events', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-white">Welcome to EventHub</h1>
        <p className="text-xl mb-8 text-teal-100">Create, manage, and attend events with ease</p>
        <Link to="/events" className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-emerald-700 transition-all shadow-lg">
          Browse All Events
        </Link>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-white">Featured Events</h2>
        {events.length === 0 ? (
          <p className="text-gray-300">No events available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                {event.image_url && (
                  <img src={event.image_url} alt={event.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{event.title}</h3>
                  <p className="text-gray-600 mb-2">{new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-gray-600 mb-4">{event.location}</p>
                  <p className="text-gray-700 mb-4 truncate">{event.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{event.rsvp_count} attendees</span>
                    <Link 
                      to={`/events/${event.id}`} 
                      className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-4 py-2 rounded hover:from-teal-600 hover:to-emerald-700 transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-xl font-bold mb-4 text-teal-300">Create Events</h3>
          <p className="text-teal-100">Easily create and customize your own events with our intuitive event creation tools.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-xl font-bold mb-4 text-emerald-300">Manage RSVPs</h3>
          <p className="text-emerald-100">Keep track of attendees, send updates, and manage your event capacity.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-xl font-bold mb-4 text-cyan-300">Discover Events</h3>
          <p className="text-cyan-100">Find and join events that interest you from a wide variety of categories.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;