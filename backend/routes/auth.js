const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const nodemailer = require('nodemailer');
const router = express.Router();

console.log('🔍 MAIN APP - Checking environment variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? `Set (length: ${process.env.EMAIL_PASS.length})` : 'UNDEFINED');
console.log('----------------------------------------');

// Configure nodemailer with better error handling
console.log('🔍 FINAL DEBUG - Checking environment variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? `"${process.env.EMAIL_PASS}" (length: ${process.env.EMAIL_PASS.length})` : 'UNDEFINED');
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
    rejectUnauthorized: false
    },
    secure: false,
    requireTLS: true
    });
} catch (error) {
  console.error('❌ Failed to create email transporter:', error);
}

// Now verify the transporter
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Email transporter configuration error:', error);
  } else {
    console.log('✅ Email transporter is ready to send messages');
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log('👤 Registration attempt:', { name, email });
    
    // Check if user exists
    console.log('📋 Checking if user already exists...');
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('✅ Email is available');

    // Hash password
    console.log('🔐 Hashing password...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed successfully');

    // Create user
    console.log('📝 Creating user in database...');
    const newUser = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    console.log('✅ User created successfully:', newUser.rows[0].email);

    // Generate token
    console.log('🎫 Generating JWT token...');
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET is missing from environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { userId: newUser.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Token generated successfully');

    // Send welcome email (if email is configured)
    if (transporter) {
      console.log('📧 Sending welcome email...');
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to EventHub!',
        html: `
          <h2>Welcome to EventHub, ${name}!</h2>
          <p>Your account has been successfully created.</p>
          <p>Start creating and managing events today!</p>
          <br>
          <p>Best regards,<br>EventHub Team</p>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('❌ Welcome email sending failed:', error);
        } else {
          console.log('✅ Welcome email sent successfully:', info.response);
        }
      });
    } else {
      console.log('⚠️ Email not configured - skipping welcome email');
    }

    res.status(201).json({
      token,
      user: newUser.rows[0]
    });

    console.log('🎉 Registration completed successfully');

  } catch (error) {
    console.error('💥 Registration error:', error);
    
    if (error.message.includes("bcrypt.hash")) {
      console.error('❌ Password hashing failed');
      return res.status(500).json({ message: 'Password processing error' });
    }
    
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for email:', email);
    
    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    console.log('📋 Checking user in database...');
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found:', user.rows[0].email);
    
    // Debug: Check what's stored in the password field
    console.log('🔍 Stored password hash:', user.rows[0].password);
    console.log('🔍 Input password:', password);

    // Verify password
    console.log('🔑 Verifying password...');
    const isValidPassword = await bcrypt.compare(password, user.rows[0].password);
    
    if (!isValidPassword) {
      console.log('❌ Password comparison failed');
      console.log('💡 Tips:');
      console.log('1. Check if user was registered with bcrypt');
      console.log('2. Verify password hashing in registration');
      console.log('3. Check if plain text password was stored by mistake');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Password verified successfully');

    // Generate JWT token
    console.log('🎫 Generating JWT token...');
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET is missing from environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { userId: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for user:', user.rows[0].email);

    // Send response
    res.json({
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        profile_picture: user.rows[0].profile_picture || '',
        bio: user.rows[0].bio || '',
        phone: user.rows[0].phone || '',
        address: user.rows[0].address || ''
      }
    });

  } catch (error) {
    console.error('💥 Login error:', error);
    
    // More specific error handling
    if (error.message.includes("bcrypt.compare")) {
      console.error('❌ BCrypt comparison error - possible password storage issue');
      return res.status(500).json({ message: 'Authentication system error' });
    }
    
    if (error.message.includes("JWT_SECRET")) {
      console.error('❌ JWT secret missing - check .env file');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔍 Fetching current user data');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded, user ID:', decoded.userId);

    const user = await db.query('SELECT id, name, email, profile_picture, bio, phone, address FROM users WHERE id = $1', [decoded.userId]);
    
    if (user.rows.length === 0) {
      console.log('❌ User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User data retrieved successfully');
    res.json(user.rows[0]);

  } catch (error) {
    console.error('💥 Get user error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('📝 Profile update request');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, email, bio, phone, address, profile_picture } = req.body;

    console.log('🔄 Updating user profile for ID:', decoded.userId);

    const updatedUser = await db.query(
      `UPDATE users 
       SET name = $1, email = $2, bio = $3, phone = $4, address = $5, profile_picture = $6 
       WHERE id = $7 
       RETURNING id, name, email, profile_picture, bio, phone, address`,
      [name, email, bio, phone, address, profile_picture, decoded.userId]
    );

    console.log('✅ Profile updated successfully');
    res.json(updatedUser.rows[0]);

  } catch (error) {
    console.error('💥 Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('🔐 Forgot password request for email:', email);
    
    if (!email) {
      console.log('❌ Email is required');
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    console.log('📋 Checking if user exists in database...');
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(404).json({ message: 'If this email exists, a reset link will be sent' });
    }

    console.log('✅ User found:', user.rows[0].email);

    // Generate reset token
    console.log('🎫 Generating password reset token...');
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET is missing from environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const resetToken = jwt.sign(
      { email: email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('✅ Reset token generated');

    // Check email configuration
    console.log('📧 Checking email configuration...');
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ Email credentials missing from environment variables');
      console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
      console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
      return res.status(500).json({ message: 'Email service not configured. Please contact support.' });
    }

    console.log('✅ Email configuration OK');

    // Check if transporter is configured
    if (!transporter) {
      console.log('❌ Email transporter not configured');
      return res.status(500).json({ message: 'Email service temporarily unavailable. Please try again later.' });
    }

    // Send reset email
    console.log('📤 Sending password reset email...');
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - EventHub',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="background-color: #0fa3b1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <br>
        <p>If you didn't request this reset, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Having trouble? Contact support at support@eventhub.com
        </p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('❌ Email sending failed:', error);
        console.log('💡 Email error details:', error.response);
        
        // Specific error handling for common email issues
        if (error.code === 'EAUTH') {
          console.log('❌ Authentication failed - check email credentials');
          return res.status(500).json({ 
            message: 'Email service configuration error. Please check your email settings.' 
          });
        }
        
        if (error.code === 'ECONNECTION') {
          console.log('❌ Connection failed - check internet or SMTP settings');
          return res.status(500).json({ 
            message: 'Unable to connect to email service. Please try again later.' 
          });
        }
        
        return res.status(500).json({ 
          message: 'Failed to send reset email. Please try again later or contact support.' 
        });
      }
      
      console.log('✅ Password reset email sent successfully:', info.response);
      console.log('📧 Message ID:', info.messageId);
      
      // Return success message even if we don't reveal whether email exists
      res.json({ 
        message: 'If this email exists in our system, a password reset link has been sent.' 
      });
    });

  } catch (error) {
    console.error('💥 Forgot password error:', error);
    
    if (error.message.includes("JWT_SECRET")) {
      console.error('❌ JWT secret missing - check .env file');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    // Generic error message for security
    res.status(500).json({ 
      message: 'An error occurred while processing your request. Please try again later.' 
    });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    console.log('🔄 Password reset attempt');
    
    if (!token || !newPassword) {
      console.log('❌ Token and new password are required');
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    console.log('🔍 Verifying reset token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified for email:', decoded.email);

    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('📝 Updating password in database...');
    const result = await db.query('UPDATE users SET password = $1 WHERE email = $2 RETURNING id', [hashedPassword, decoded.email]);
    
    if (result.rows.length === 0) {
      console.log('❌ User not found for email:', decoded.email);
      return res.status(400).json({ message: 'Invalid reset token' });
    }
    
    console.log('✅ Password reset successfully for:', decoded.email);
    res.json({ message: 'Password reset successfully. You can now login with your new password.' });

  } catch (error) {
    console.error('💥 Reset password error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      console.log('❌ Invalid or expired token');
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new reset link.' });
    }
    
    if (error.message.includes("bcrypt.hash")) {
      console.error('❌ Password hashing failed');
      return res.status(500).json({ message: 'Password processing error' });
    }
    
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;