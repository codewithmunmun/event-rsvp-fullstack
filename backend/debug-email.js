// debug-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🛠️  ULTIMATE DEBUG - Checking EVERYTHING:');
console.log('-----------------------------------------');

// 1. Check if .env file is loading
console.log('1. Checking .env file loading:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER || 'UNDEFINED');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? `"${process.env.EMAIL_PASS}" (length: ${process.env.EMAIL_PASS.length})` : 'UNDEFINED');

// 2. Try to create transporter
console.log('\n2. Creating transporter...');
try {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // 3. Verify connection
  console.log('3. Verifying connection...');
  transporter.verify((error, success) => {
    if (error) {
      console.log('   ❌ VERIFICATION FAILED:', error.message);
      console.log('   💡 Error code:', error.code);
      
      // Specific troubleshooting based on error code
      if (error.code === 'EAUTH') {
        console.log('\n   🚨 SOLUTION:');
        console.log('   - Regenerate App Password in Google Account');
        console.log('   - Ensure 2FA is enabled');
        console.log('   - Check for special characters in password');
      }
    } else {
      console.log('   ✅ SUCCESS: Server is ready to send emails!');
      
      // 4. Try to actually send a test email
      console.log('\n4. Sending test email...');
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to yourself
        subject: 'TEST EMAIL - EventHub',
        text: 'This is a test email from your EventHub server!'
      }, (sendError, info) => {
        if (sendError) {
          console.log('   ❌ SEND FAILED:', sendError.message);
        } else {
          console.log('   ✅ EMAIL SENT SUCCESSFULLY!');
          console.log('   Message ID:', info.messageId);
        }
        process.exit();
      });
    }
  });
} catch (error) {
  console.log('   ❌ TRANSPORTER CREATION FAILED:', error.message);
  process.exit();
}