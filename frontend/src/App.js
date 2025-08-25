import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import MyRSVPs from './pages/MyRSVPs';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <div className="container mx-auto px-4">
            <Routes>
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/create-event" element={
                <PrivateRoute>
                  <CreateEvent />
                </PrivateRoute>
              } />
              <Route path="/my-events" element={
                <PrivateRoute>
                  <MyEvents />
                </PrivateRoute>
              } />
              <Route path="/my-rsvps" element={
                <PrivateRoute>
                  <MyRSVPs />
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;