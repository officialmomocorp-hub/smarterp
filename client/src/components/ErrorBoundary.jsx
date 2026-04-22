import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("FATAL REACT ERROR:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          width: '100vw', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#0B1121', 
          color: '#fb7185',
          fontFamily: 'monospace',
          padding: '40px',
          boxSizing: 'border-box'
        }}>
          <div style={{ maxWidth: '800px', border: '1px solid #fb718533', padding: '30px', borderRadius: '12px', background: '#1e1b4b' }}>
            <h1 style={{ margin: '0 0 20px 0' }}>🚨 Frontend Crash Detected</h1>
            <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Something went wrong during the SmartERP initialization process.</p>
            <div style={{ background: '#000', padding: '15px', borderRadius: '6px', overflowX: 'auto' }}>
              <pre style={{ margin: 0 }}>{this.state.error?.toString()}</pre>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              style={{ marginTop: '20px', background: '#fb7185', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Force Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
