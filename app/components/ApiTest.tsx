import React, { useState, useEffect } from 'react';
import { getMyParticipations, enrollInEvent, cancelEnrollment } from '../services/events';
import { isAxiosError } from 'axios';
import type { ParticipationResponse } from '../services/events';

export default function ApiTest() {
  const [participations, setParticipations] = useState<ParticipationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Test 1: Get participations
      console.log('Testing getMyParticipations...');
      const participationsData = await getMyParticipations();
      console.log('✅ getMyParticipations success:', participationsData);
      setParticipations(participationsData);
      
      // Test 2: Try to enroll in a test event (using a dummy ID)
      console.log('Testing enrollInEvent...');
      try {
        const enrollmentResult = await enrollInEvent('test-event-id');
        console.log('✅ enrollInEvent success:', enrollmentResult);
        setTestResult('Enroll test: SUCCESS');
      } catch (enrollError: unknown) {
        console.log('❌ enrollInEvent failed (expected for dummy ID):', enrollError);
        const message = isAxiosError(enrollError)
          ? (enrollError.response?.data as { message?: string } | undefined)?.message || enrollError.message
          : (enrollError as { message?: string })?.message || "Unknown error";
        setTestResult(`Enroll test: ${message}`);
      }
      
    } catch (err: unknown) {
      console.error('❌ API Test failed:', err);
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message || err.message
        : (err as { message?: string })?.message || "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const testCancel = async () => {
    try {
      console.log('Testing cancelEnrollment...');
      await cancelEnrollment('test-event-id');
      console.log('✅ cancelEnrollment success');
      setTestResult('Cancel test: SUCCESS');
    } catch (err: unknown) {
      console.log('❌ cancelEnrollment failed (expected for dummy ID):', err);
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message || err.message
        : (err as { message?: string })?.message || "Unknown error";
      setTestResult(`Cancel test: ${message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>API Test Component</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Participations:</h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : (
          <pre>{JSON.stringify(participations, null, 2)}</pre>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test Results:</h3>
        <p>{testResult}</p>
      </div>
      
      <div>
        <button onClick={testAPI} style={{ marginRight: '10px' }}>
          Test API Again
        </button>
        <button onClick={testCancel}>
          Test Cancel
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Console Instructions:</h3>
        <p>Open browser console (F12) to see detailed API logs</p>
        <p>Check for:</p>
        <ul>
          <li>API Request logs</li>
          <li>Token availability</li>
          <li>Response status codes</li>
          <li>Error messages</li>
        </ul>
      </div>
    </div>
  );
}
