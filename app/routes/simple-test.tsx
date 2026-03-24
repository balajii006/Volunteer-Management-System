import React, { useState, useEffect } from 'react';

type ErrorWithMessage = {
  message?: string;
};

export default function SimpleTest() {
  const [message, setMessage] = useState('Loading...');
  const [token, setToken] = useState('');

  useEffect(() => {
    // Check if we're logged in
    const accessToken = localStorage.getItem('accessToken');
    const tokenValue = localStorage.getItem('token');
    
    console.log('Checking tokens...');
    console.log('accessToken:', accessToken);
    console.log('token:', tokenValue);
    
    setToken(accessToken || tokenValue || 'No token found');
    
    if (accessToken || tokenValue) {
      setMessage('✅ Token found - you should be able to enroll/unenroll');
    } else {
      setMessage('❌ No token found - please login first');
    }
  }, []);

  const testAPI = async () => {
    try {
      const response = await fetch('https://gateway-service-production-37b5.up.railway.app/vms-api/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const events = await response.json();
        console.log('Events loaded:', events);
        setMessage(`✅ API working! Found ${events.length} events`);
      } else {
        console.error('API error:', response.status);
        setMessage(`❌ API error: ${response.status}`);
      }
    } catch (error: unknown) {
      console.error('Network error:', error);
      const message = (error as ErrorWithMessage).message || "Unknown error";
      setMessage(`❌ Network error: ${message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🔍 Simple Debug Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>Authentication Status:</h3>
        <p><strong>Token:</strong> {token ? 'Found' : 'Not found'}</p>
        <p><strong>Token Value:</strong> {token.substring(0, 20)}...</p>
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>Status:</h3>
        <p>{message}</p>
      </div>
      
      <button onClick={testAPI} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
        Test API Connection
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Check if you have a token (should be logged in)</li>
          <li>Click "Test API Connection" to test the backend</li>
          <li>Open console (F12) to see detailed logs</li>
          <li>If no token, go to <a href="/login">login page</a></li>
        </ol>
      </div>
    </div>
  );
}
