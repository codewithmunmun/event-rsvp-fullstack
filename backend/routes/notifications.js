const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all notifications for a user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await db.query(
      `SELECT n.*, e.title as event_title 
       FROM notifications n 
       LEFT JOIN events e ON n.event_id = e.id 
       WHERE n.user_id = $1 
       ORDER BY n.created_at DESC`,
      [req.userId]
    );
    
    res.json(notifications.rows);
  } catch (error) {
    console.error('Failed to fetch notifications', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    // Check if notification belongs to user
    const notification = await db.query(
      'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    
    if (notification.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    const updatedNotification = await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    
    res.json(updatedNotification.rows[0]);
  } catch (error) {
    console.error('Failed to mark notification as read', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [req.userId]
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Failed to mark all notifications as read', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a notification
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if notification belongs to user
    const notification = await db.query(
      'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    
    if (notification.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await db.query('DELETE FROM notifications WHERE id = $1', [req.params.id]);
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Failed to delete notification', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;