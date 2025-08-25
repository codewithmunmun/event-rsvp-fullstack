const express = require('express');
const QRCode = require('qrcode');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate QR code for event check-in
router.get('/event/:id', auth, async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Verify user owns the event or is admin
    const event = await db.query(
      'SELECT * FROM events WHERE id = $1 AND (host_id = $2 OR $3 = true)',
      [eventId, req.userId, req.userRole === 'admin']
    );
    
    if (event.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found or not authorized' });
    }

    // Generate QR code data (event ID + secret key)
    const qrData = JSON.stringify({
      eventId: eventId,
      timestamp: Date.now(),
      secret: process.env.QR_SECRET || 'eventhub-secret'
    });

    // Generate QR code as PNG
    const qrCodeImage = await QRCode.toDataURL(qrData);
    
    res.json({ qrCode: qrCodeImage });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
});

// Verify QR code and check-in attendee
router.post('/checkin', auth, async (req, res) => {
  try {
    const { qrData } = req.body;
    
    // Parse QR code data
    const parsedData = JSON.parse(qrData);
    
    // Verify secret key
    if (parsedData.secret !== (process.env.QR_SECRET || 'eventhub-secret')) {
      return res.status(401).json({ message: 'Invalid QR code' });
    }

    // Verify event exists and user is host/admin
    const event = await db.query(
      'SELECT * FROM events WHERE id = $1 AND (host_id = $2 OR $3 = true)',
      [parsedData.eventId, req.userId, req.userRole === 'admin']
    );
    
    if (event.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found or not authorized' });
    }

    // Check if user has RSVP'd
    const rsvp = await db.query(
      'SELECT * FROM rsvps WHERE event_id = $1 AND user_id = $2 AND status = $3',
      [parsedData.eventId, req.userId, 'confirmed']
    );
    
    if (rsvp.rows.length === 0) {
      return res.status(400).json({ message: 'You must RSVP to check in' });
    }

    // Update check-in status
    await db.query(
      'UPDATE rsvps SET checked_in = true, checkin_time = NOW() WHERE event_id = $1 AND user_id = $2',
      [parsedData.eventId, req.userId]
    );

    res.json({ message: 'Check-in successful!' });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Check-in failed' });
  }
});

module.exports = router;