import React, { useState } from 'react'
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  async function callPython(fn) {
    setLoading(true);
    setResult('');
    try {
      setResult(await fn());
    } catch (err) {
      setResult(err?.toString?.() ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Segoe UI, system-ui, sans-serif', maxWidth: '640px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: 4 }}>Embedded Python Demo</h1>
      <p style={{ color: '#666', marginTop: 0 }}>React → Rust → bundled CPython (Windows / macOS / Linux)</p>

      <div style={{ marginBottom: '24px' }}>
        <h3>Runtime info</h3>
        <button
          onClick={() => callPython(() => invoke('python_info'))}
          disabled={loading}
          style={btn(loading, '#607d8b')}
        >
          {loading ? 'Calling Python...' : 'Call python_info'}
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3>Simple addition</h3>
        <button
          onClick={() => callPython(() => invoke('add'))}
          disabled={loading}
          style={btn(loading, '#4CAF50')}
        >
          {loading ? 'Calling Python...' : 'Call Add'}
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3>Print name</h3>
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
          onClick={() => {
            if (!name.trim()) {
              setResult('Please enter a name');
              return;
            }
            callPython(() => invoke('add_name', { name }));
          }}
          disabled={loading}
          style={btn(loading, '#2196F3')}
        >
          {loading ? 'Calling Python...' : 'Call PrintName'}
        </button>
      </div>

      {loading && (
        <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '6px', textAlign: 'center' }}>
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
          <h3 style={{ marginTop: 0 }}>Result from Python</h3>
          <pre style={{ fontSize: '16px', margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>
        </div>
      )}
    </div>
  )
}

function btn(loading, color) {
  return {
    padding: '15px 30px',
    fontSize: '16px',
    backgroundColor: loading ? '#ccc' : color,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: loading ? 'not-allowed' : 'pointer',
    width: '100%'
  };
}

export default App
