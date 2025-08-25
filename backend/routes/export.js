const express = require('express');
const { Parser } = require('json2csv');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Export attendees as CSV
router.get('/event/:id/attendees', auth, async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Verify user owns the event
    const event = await db.query(
      'SELECT * FROM events WHERE id = $1 AND host_id = $2',
      [eventId, req.userId]
    );
    
    if (event.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found or not authorized' });
    }

    // Get attendees
    const attendees = await db.query(`
      SELECT u.name, u.email, r.guests_count, r.status, r.checked_in, r.checkin_time
      FROM rsvps r
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = $1 AND r.status = 'confirmed'
      ORDER BY u.name
    `, [eventId]);

    // Convert to CSV
    const fields = [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Guests', value: 'guests_count' },
      { label: 'Status', value: 'status' },
      { label: 'Checked In', value: 'checked_in' },
      { label: 'Check-in Time', value: 'checkin_time' }
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(attendees.rows);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendees-event-${eventId}.csv`);
    
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ message: 'Export failed' });
  }
});

module.exports = router;