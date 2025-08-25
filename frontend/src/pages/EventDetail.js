import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [userRsvp, setUserRsvp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [guestsCount, setGuestsCount] = useState(1);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/api/events/${id}`);
        setEvent(response.data);
        setRsvps(response.data.rsvps || []);
        
        // Check if current user has RSVP'd
        if (currentUser) {
          const userRsvp = response.data.rsvps.find(rsvp => rsvp.user_id === currentUser.id);
          if (userRsvp) {
            setUserRsvp(userRsvp);
            setGuestsCount(userRsvp.guests_count);
          }
        }
      } catch (error) {
        console.error('Failed to fetch event', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, currentUser]);

  const handleRSVP = async (status) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setRsvpLoading(true);
      const response = await axios.post('/api/rsvps', {
        event_id: id,
        status,
        guests_count: guestsCount
      });
      
      setUserRsvp(response.data);
      
      // Update the event RSVP count
      const updatedEvent = { ...event };
      if (status === 'confirmed') {
        updatedEvent.rsvp_count = (updatedEvent.rsvp_count || 0) + 1;
      }
      setEvent(updatedEvent);
      
      // Add to RSVPs list
      if (!rsvps.find(r => r.id === response.data.id)) {
        setRsvps([...rsvps, { ...response.data, user_name: currentUser.name }]);
      }
    } catch (error) {
      console.error('Failed to RSVP', error);
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleUpdateRSVP = async (status) => {
    try {
      setRsvpLoading(true);
      const response = await axios.put(`/api/rsvps/${userRsvp.id}`, {
        status,
        guests_count: guestsCount
      });
      
      setUserRsvp(response.data);
    } catch (error) {
      console.error('Failed to update RSVP', error);
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading event details...</div>;
  }

  if (!event) {
    return <div className="text-center py-8">Event not found.</div>;
  }

  const confirmedAttendees = rsvps.filter(rsvp => rsvp.status === 'confirmed');
  const isHost = currentUser && currentUser.id === event.host_id;
  const isFull = confirmedAttendees.length >= event.capacity;

  return (
    <div className="py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {event.image_url && (
          <img src={event.image_url} alt={event.title} className="w-full h-64 object-cover" />
        )}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-gray-600 mb-4">
            Hosted by <span className="font-semibold">{event.host_name}</span>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Date & Time</h2>
              <p>{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <p>{event.location}</p>
            </div>
            
            {event.category && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Category</h2>
                <p>{event.category}</p>
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Capacity</h2>
              <p>{confirmedAttendees.length} attending of {event.capacity} spots</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{event.description}</p>
          </div>
          
          {!isHost && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">RSVP to this event</h2>
              
              {userRsvp ? (
                <div>
                  <p className="mb-4">
                    Your current status: 
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                      userRsvp.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      userRsvp.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {userRsvp.status}
                    </span>
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Number of guests (including yourself)</label>
                    <input
                      type="number"
                      min="1"
                      max={event.capacity - confirmedAttendees.length + (userRsvp.status === 'confirmed' ? userRsvp.guests_count : 0)}
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                      className="border rounded px-3 py-2 w-24"
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleUpdateRSVP('confirmed')}
                      disabled={rsvpLoading || (isFull && userRsvp.status !== 'confirmed')}
                      className={`px-4 py-2 rounded ${
                        isFull && userRsvp.status !== 'confirmed' 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {rsvpLoading ? 'Updating...' : 'Confirm Attendance'}
                    </button>
                    
                    <button
                      onClick={() => handleUpdateRSVP('declined')}
                      disabled={rsvpLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      {rsvpLoading ? 'Updating...' : 'Decline'}
                    </button>
                  </div>
                  
                  {isFull && userRsvp.status !== 'confirmed' && (
                    <p className="text-red-600 mt-2">This event is at full capacity.</p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Number of guests (including yourself)</label>
                    <input
                      type="number"
                      min="1"
                      max={event.capacity - confirmedAttendees.length}
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                      className="border rounded px-3 py-2 w-24"
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleRSVP('confirmed')}
                      disabled={rsvpLoading || isFull}
                      className={`px-4 py-2 rounded ${
                        isFull 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {rsvpLoading ? 'Processing...' : 'RSVP Now'}
                    </button>
                    
                    <button
                      onClick={() => handleRSVP('declined')}
                      disabled={rsvpLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      {rsvpLoading ? 'Processing...' : 'Decline'}
                    </button>
                  </div>
                  
                  {isFull && (
                    <p className="text-red-600 mt-2">This event is at full capacity.</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {isHost && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Host Controls</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate(`/edit-event/${event.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Edit Event
                </button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
                  Send Updates
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Attendees ({confirmedAttendees.length})</h2>
        
        {confirmedAttendees.length === 0 ? (
          <p className="text-gray-500">No attendees yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {confirmedAttendees.map(rsvp => (
              <div key={rsvp.id} className="border rounded-lg p-4">
                <p className="font-semibold">{rsvp.user_name}</p>
                <p className="text-sm text-gray-600">{rsvp.guests_count} guests</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;