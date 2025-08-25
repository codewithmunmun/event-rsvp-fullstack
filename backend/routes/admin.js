const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get overall statistics
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM events) as total_events,
        (SELECT COUNT(*) FROM rsvps WHERE status = 'confirmed') as total_rsvps,
        (SELECT COUNT(*) FROM rsvps WHERE checked_in = true) as total_checkins
    `);
    
    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Get event-wise RSVP statistics
router.get('/events/stats', auth, requireAdmin, async (req, res) => {
  try {
    const eventStats = await db.query(`
      SELECT 
        e.id,
        e.title,
        e.date,
        e.location,
        e.capacity,
        COUNT(r.id) as total_rsvps,
        COUNT(CASE WHEN r.checked_in = true THEN 1 END) as checked_in_count,
        COUNT(CASE WHEN r.status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN r.status = 'declined' THEN 1 END) as declined_count
      FROM events e
      LEFT JOIN rsvps r ON e.id = r.event_id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `);
    
    res.json(eventStats.rows);
  } catch (error) {
    console.error('Event stats error:', error);
    res.status(500).json({ message: 'Failed to fetch event statistics' });
  }
});

// Get user activity statistics
router.get('/users/activity', auth, requireAdmin, async (req, res) => {
  try {
    const userActivity = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.created_at,
        COUNT(DISTINCT e.id) as events_created,
        COUNT(DISTINCT r.event_id) as events_attended,
        COUNT(DISTINCT CASE WHEN r.checked_in = true THEN r.event_id END) as events_checked_in
      FROM users u
      LEFT JOIN events e ON u.id = e.host_id
      LEFT JOIN rsvps r ON u.id = r.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    
    res.json(userActivity.rows);
  } catch (error) {
    console.error('User activity error:', error);
    res.status(500).json({ message: 'Failed to fetch user activity' });
  }
});

module.exports = router;