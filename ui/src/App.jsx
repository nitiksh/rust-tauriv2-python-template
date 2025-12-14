import React, { useState } from 'react'
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  async function callAdd() {
    setLoading(true);
    setResult('');

    try {
      const pythonResult = await invoke('add');
      setResult(pythonResult);
    } catch (err) {
      setResult(err.toString());
    } finally {
      setLoading(false);
    }
  }

  async function callPrintName() {
    if (!name.trim()) {
      setResult('Please enter a name');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const pythonResult = await invoke('add_name', { name: name });
      setResult(pythonResult);
    } catch (err) {
      setResult(err.toString());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Python Functions Demo</h1>
      <p style={{ color: '#666' }}>React → Rust → Python</p>

      <div style={{ marginBottom: '30px' }}>
        <h3>Simple Addition</h3>
        <button
          onClick={callAdd}
          disabled={loading}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Calling Python...' : 'Call Add Function'}
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Print Name</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          style={{
            padding: '10px',
            fontSize: '16px',
            width: '100%',
            marginBottom: '10px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            boxSizing: 'border-box'
          }}
        />
        <button
          onClick={callPrintName}
          disabled={loading}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Calling Python...' : 'Call PrintName Function'}
        </button>
      </div>

      {loading && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f0f0f0',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          Loading...
        </div>
      )}

      {result && !loading && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '2px solid #0070f3'
        }}>
          <h3 style={{ marginTop: 0 }}>Result from Python:</h3>
          <p style={{ fontSize: '18px', margin: 0 }}>{result}</p>
        </div>
      )}
    </div>
  )
}

export default App