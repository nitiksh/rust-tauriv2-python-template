import React, { useState } from 'react'
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function calculateSum() {
    if (!num1 || !num2) {
      setError('Please enter both numbers');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const pythonResult = await invoke("run_python", {
        args: [num1, num2]
      });
      setResult(pythonResult);
      console.log("Python says:", pythonResult);
    } catch (err) {
      setError(err.toString());
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Python Addition Calculator</h1>
      <p style={{ color: '#666' }}>Using Python as Backend</p>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="number"
          value={num1}
          onChange={(e) => setNum1(e.target.value)}
          placeholder="Enter first number"
          style={{
            padding: '10px',
            fontSize: '16px',
            width: '100%',
            marginBottom: '10px',
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}
        />
        <input
          type="number"
          value={num2}
          onChange={(e) => setNum2(e.target.value)}
          placeholder="Enter second number"
          style={{
            padding: '10px',
            fontSize: '16px',
            width: '100%',
            marginBottom: '10px',
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}
        />
      </div>

      <button
        onClick={calculateSum}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          width: '100%'
        }}
      >
        {loading ? 'Calculating...' : 'Calculate Sum'}
      </button>

      {result && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f0f0f0',
          borderRadius: '6px',
          border: '1px solid #ddd'
        }}>
          <h3 style={{ marginTop: 0 }}>Result:</h3>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#ffebee',
          borderRadius: '6px',
          border: '1px solid #f44336',
          color: '#c62828'
        }}>
          <h3 style={{ marginTop: 0 }}>Error:</h3>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}
    </div>
  )
}

export default App