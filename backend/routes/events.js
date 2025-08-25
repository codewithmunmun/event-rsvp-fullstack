const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Sample data for demonstration
const sampleEvents = [
  {
    title: "Tech Conference 2024",
    description: "Annual technology conference featuring the latest innovations in AI, Web Development, and Cloud Computing",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    location: "Convention Center, Tech City",
    category: "Conference",
    capacity: 500,
    image_url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600",
    is_public: true
  },
  {
    title: "Live Music Festival",
    description: "Weekend music festival featuring top artists across multiple genres. Food trucks and beverages available.",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    location: "Central Park, Musicville",
    category: "Music",
    capacity: 1000,
    image_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600",
    is_public: true
  },
  {
    title: "Startup Workshop",
    description: "Hands-on workshop for aspiring entrepreneurs. Learn pitching, funding, and business development strategies.",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (past)
    location: "Innovation Hub, Business District",
    category: "Workshop",
    capacity: 50,
    image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600",
    is_public: true
  },
  {
    title: "Charity Gala Dinner",
    description: "Elegant evening supporting local charities. Black-tie optional with silent auction and live entertainment.",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    location: "Grand Hotel Ballroom",
    category: "Charity",
    capacity: 200,
    image_url: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=600",
    is_public: true
  },
  {
    title: "Yoga & Wellness Retreat",
    description: "Weekend retreat for mind and body wellness. Includes meditation sessions, healthy meals, and nature walks.",
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    location: "Serenity Resort, Mountain View",
    category: "Wellness",
    capacity: 30,
    image_url: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600",
    is_public: true
  },
  {
    title: "Coding Bootcamp",
    description: "Intensive 2-day coding bootcamp focusing on React.js and Node.js. Bring your laptop and enthusiasm!",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    location: "Tech Campus, Computer Lab 3B",
    category: "Workshop",
    capacity: 40,
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
    is_public: true
  }
];

// Function to add sample events
const addSampleEvents = async () => {
  try {
    // Check if sample events already exist
    const existingEvents = await db.query('SELECT COUNT(*) FROM events');
    
    if (parseInt(existingEvents.rows[0].count) === 0) {
      console.log('Adding sample events to database...');
      
      // Create a demo host user if doesn't exist
      const demoHost = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING RETURNING id',
        ['Demo Host', 'demo@eventhub.com', '$2a$10$exampleHash', 'user']
      );
      
      let hostId = 1; // Default to user ID 1 (usually the first user)
      
      if (demoHost.rows.length > 0) {
        hostId = demoHost.rows[0].id;
      } else {
        // If demo host already exists, get their ID
        const existingHost = await db.query('SELECT id FROM users WHERE email = $1', ['demo@eventhub.com']);
        if (existingHost.rows.length > 0) {
          hostId = existingHost.rows[0].id;
        }
      }
      
      // Insert sample events
      for (const eventData of sampleEvents) {
        await db.query(
          `INSERT INTO events (host_id, title, description, date, location, category, capacity, image_url, is_public) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            hostId, 
            eventData.title, 
            eventData.description, 
            eventData.date, 
            eventData.location, 
            eventData.category, 
            eventData.capacity, 
            eventData.image_url, 
            eventData.is_public
          ]
        );
      }
      console.log('✅ Sample events added successfully');
    }
  } catch (error) {
    console.error('❌ Error adding sample events:', error.message);
  }
};

// Call this function when the server starts
addSampleEvents();

// Get all public events with filtering
router.get('/', async (req, res) => {
  try {
    const { category, upcoming, past } = req.query;
    
    let query = `
      SELECT e.*, u.name as host_name, 
      COUNT(r.id) as rsvp_count 
      FROM events e 
      LEFT JOIN users u ON e.host_id = u.id 
      LEFT JOIN rsvps r ON e.id = r.event_id AND r.status = 'confirmed'
      WHERE e.is_public = true
    `;
    
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND e.category = $${paramCount}`;
      params.push(category);
    }

    if (upcoming === 'true') {
      query += ` AND e.date > NOW()`;
    } else if (past === 'true') {
      query += ` AND e.date <= NOW()`;
    }

    query += ` GROUP BY e.id, u.name ORDER BY e.date ASC`;

    const events = await db.query(query, params);
    
    res.json(events.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get events by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const events = await db.query(`
      SELECT e.*, u.name as host_name, 
      COUNT(r.id) as rsvp_count 
      FROM events e 
      LEFT JOIN users u ON e.host_id = u.id 
      LEFT JOIN rsvps r ON e.id = r.event_id AND r.status = 'confirmed'
      WHERE e.is_public = true AND e.category = $1 AND e.date > NOW()
      GROUP BY e.id, u.name
      ORDER BY e.date ASC
    `, [category]);
    
    res.json(events.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming events
router.get('/upcoming/events', async (req, res) => {
  try {
    const events = await db.query(`
      SELECT e.*, u.name as host_name, 
      COUNT(r.id) as rsvp_count 
      FROM events e 
      LEFT JOIN users u ON e.host_id = u.id 
      LEFT JOIN rsvps r ON e.id = r.event_id AND r.status = 'confirmed'
      WHERE e.is_public = true AND e.date > NOW()
      GROUP BY e.id, u.name
      ORDER BY e.date ASC
      LIMIT 10
    `);
    
    res.json(events.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get past events
router.get('/past/events', async (req, res) => {
  try {
    const events = await db.query(`
      SELECT e.*, u.name as host_name, 
      COUNT(r.id) as rsvp_count 
      FROM events e 
      LEFT JOIN users u ON e.host_id = u.id 
      LEFT JOIN rsvps r ON e.id = r.event_id AND r.status = 'confirmed'
      WHERE e.is_public = true AND e.date <= NOW()
      GROUP BY e.id, u.name
      ORDER BY e.date DESC
      LIMIT 10
    `);
    
    res.json(events.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Keep all your existing routes below (get by ID, create, update, delete, user events)
// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await db.query(`
      SELECT e.*, u.name as host_name 
      FROM events e 
      LEFT JOIN users u ON e.host_id = u.id 
      WHERE e.id = $1
    `, [req.params.id]);
    
    if (event.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get RSVPs for this event
    const rsvps = await db.query(`
      SELECT r.*, u.name as user_name 
      FROM rsvps r 
      LEFT JOIN users u ON r.user_id = u.id 
      WHERE r.event_id = $1
    `, [req.params.id]);
    
    res.json({
      ...event.rows[0],
      rsvps: rsvps.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, date, location, category, capacity, is_public, image_url } = req.body;
    
    const newEvent = await db.query(
      `INSERT INTO events 
      (host_id, title, description, date, location, category, capacity, is_public, image_url) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [req.userId, title, description, date, location, category, capacity, is_public, image_url]
    );
    
    res.status(201).json(newEvent.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, date, location, category, capacity, is_public, image_url } = req.body;
    
    // Check if user owns the event
    const event = await db.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (event.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.rows[0].host_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedEvent = await db.query(
      `UPDATE events 
      SET title = $1, description = $2, date = $3, location = $4, 
      category = $5, capacity = $6, is_public = $7, image_url = $8, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $9 RETURNING *`,
      [title, description, date, location, category, capacity, is_public, image_url, req.params.id]
    );
    
    res.json(updatedEvent.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user owns the event
    const event = await db.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (event.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.rows[0].host_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await db.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's events
router.get('/user/events', auth, async (req, res) => {
  try {
    const events = await db.query(`
      SELECT e.*, COUNT(r.id) as rsvp_count 
      FROM events e 
      LEFT JOIN rsvps r ON e.id = r.event_id AND r.status = 'confirmed'
      WHERE e.host_id = $1 
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `, [req.userId]);
    
    res.json(events.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;