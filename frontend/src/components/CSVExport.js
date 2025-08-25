import React from 'react';

const CSVExport = ({ eventId, eventTitle }) => {
  const downloadCSV = async () => {
    try {
      const response = await fetch(`/api/export/event/${eventId}/attendees`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendees-${eventTitle}.csv`.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <button onClick={downloadCSV} className="btn-secondary">
      Export Attendees CSV
    </button>
  );
};

export default CSVExport;