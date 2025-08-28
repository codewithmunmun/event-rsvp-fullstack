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
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      alert('Failed to RSVP: ' + (error.response?.data?.message || 'Please try again'));
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
      
      // Update RSVP count if changing from/to confirmed
      if (userRsvp.status === 'confirmed' && status !== 'confirmed') {
        setEvent(prev => ({ ...prev, rsvp_count: prev.rsvp_count - 1 }));
      } else if (userRsvp.status !== 'confirmed' && status === 'confirmed') {
        setEvent(prev => ({ ...prev, rsvp_count: prev.rsvp_count + 1 }));
      }
    } catch (error) {
      console.error('Failed to update RSVP', error);
      alert('Failed to update RSVP: ' + (error.response?.data?.message || 'Please try again'));
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await axios.delete(`/api/events/${id}`);
      navigate('/my-events');
    } catch (error) {
      console.error('Failed to delete event', error);
      alert('Failed to delete event: ' + (error.response?.data?.message || 'Please try again'));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-8 text-xl">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-8 text-xl text-red-600">Event not found.</div>
      </div>
    );
  }

  const confirmedAttendees = rsvps.filter(rsvp => rsvp.status === 'confirmed');
  const isHost = currentUser && currentUser.id === event.host_id;
  const isFull = confirmedAttendees.length >= event.capacity;
  const availableSpots = event.capacity - confirmedAttendees.length;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {event.image_url && (
            <img 
              src={event.image_url} 
              alt={event.title} 
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">{event.title}</h1>
            <p className="text-gray-600 mb-4">
              Hosted by <span className="font-semibold text-teal-600">{event.host_name}</span>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2 text-gray-700">Date & Time</h2>
                <p className="text-gray-800">
                  {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2 text-gray-700">Location</h2>
                <p className="text-gray-800">{event.location}</p>
              </div>
              
              {event.category && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2 text-gray-700">Category</h2>
                  <span className="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {event.category}
                  </span>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2 text-gray-700">Capacity</h2>
                <p className="text-gray-800">
                  <span className="font-bold text-green-600">{confirmedAttendees.length}</span> attending of{' '}
                  <span className="font-bold">{event.capacity}</span> spots
                  {isFull && (
                    <span className="ml-2 text-red-600 text-sm font-semibold">(FULL)</span>
                  )}
                </p>
                {!isFull && (
                  <p className="text-sm text-gray-600 mt-1">
                    {availableSpots} spots available
                  </p>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-700">Description</h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
            
            {!isHost && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">RSVP to this event</h2>
                
                {userRsvp ? (
                  <div>
                    <p className="mb-4">
                      Your current status:{' '}
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        userRsvp.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        userRsvp.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {userRsvp.status.toUpperCase()}
                      </span>
                    </p>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2 font-semibold">
                        Number of guests (including yourself)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={Math.min(event.capacity, availableSpots + (userRsvp.status === 'confirmed' ? userRsvp.guests_count : 0))}
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="border rounded px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleUpdateRSVP('confirmed')}
                        disabled={rsvpLoading || (isFull && userRsvp.status !== 'confirmed')}
                        className={`px-6 py-2 rounded font-semibold transition-colors ${
                          isFull && userRsvp.status !== 'confirmed' 
                            ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {rsvpLoading ? 'Updating...' : 'Confirm Attendance'}
                      </button>
                      
                      <button
                        onClick={() => handleUpdateRSVP('declined')}
                        disabled={rsvpLoading}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold transition-colors"
                      >
                        {rsvpLoading ? 'Updating...' : 'Decline'}
                      </button>
                    </div>
                    
                    {isFull && userRsvp.status !== 'confirmed' && (
                      <p className="text-red-600 mt-2 font-semibold">This event is at full capacity.</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2 font-semibold">
                        Number of guests (including yourself)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={availableSpots}
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="border rounded px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleRSVP('confirmed')}
                        disabled={rsvpLoading || isFull}
                        className={`px-6 py-2 rounded font-semibold transition-colors ${
                          isFull 
                            ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {rsvpLoading ? 'Processing...' : 'RSVP Now'}
                      </button>
                      
                      <button
                        onClick={() => handleRSVP('declined')}
                        disabled={rsvpLoading}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold transition-colors"
                      >
                        {rsvpLoading ? 'Processing...' : 'Decline'}
                      </button>
                    </div>
                    
                    {isFull && (
                      <p className="text-red-600 mt-2 font-semibold">This event is at full capacity.</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {isHost && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Host Controls</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate(`/edit-event/${event.id}`)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded font-semibold transition-colors"
                  >
                    Edit Event
                  </button>
                  <button 
                    onClick={handleDeleteEvent}
                    disabled={deleteLoading}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold transition-colors disabled:opacity-50"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Event'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Attendees ({confirmedAttendees.length})</h2>
          
          {confirmedAttendees.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No attendees yet. Be the first to RSVP!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {confirmedAttendees.map(rsvp => (
                <div key={rsvp.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <p className="font-semibold text-gray-800">{rsvp.user_name}</p>
                  <p className="text-sm text-gray-600">
                    {rsvp.guests_count} guest{rsvp.guests_count !== 1 ? 's' : ''}
                  </p>
                  {rsvp.checked_in && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2">
                      Checked In
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;