import React, { useState } from 'react';
import axios from 'axios';

const QRCodeGenerator = ({ eventId }) => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/qrcode/event/${eventId}`);
      setQrCode(response.data.qrCode);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Event QR Code</h3>
      <button
        onClick={generateQRCode}
        disabled={loading}
        className="btn-primary mb-4"
      >
        {loading ? 'Generating...' : 'Generate QR Code'}
      </button>
      
      {qrCode && (
        <div className="text-center">
          <img src={qrCode} alt="Event QR Code" className="mx-auto mb-4 w-48 h-48" />
          <p className="text-sm text-gray-600">Scan this code for event check-in</p>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;