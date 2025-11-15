import React, { useState, useEffect } from 'react';

const DebugLogs = () => {
  const [logs, setLogs] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadLogs = () => {
    try {
      const debugLogs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
      setLogs(debugLogs.reverse()); // Mới nhất trước
    } catch (e) {
      console.error('Failed to load logs:', e);
      setLogs([]);
    }
  };

  const clearLogs = () => {
    localStorage.removeItem('debug_logs');
    setLogs([]);
  };

  useEffect(() => {
    loadLogs();
    
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h1>Debug Logs</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={loadLogs} style={{ marginRight: '10px' }}>Refresh</button>
        <button onClick={clearLogs} style={{ marginRight: '10px' }}>Clear Logs</button>
        <label>
          <input 
            type="checkbox" 
            checked={autoRefresh} 
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh
        </label>
      </div>

      <div style={{ 
        backgroundColor: '#1e1e1e', 
        color: '#d4d4d4', 
        padding: '15px', 
        borderRadius: '5px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {logs.length === 0 ? (
          <p>No logs available</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ 
              marginBottom: '15px', 
              paddingBottom: '15px', 
              borderBottom: '1px solid #444' 
            }}>
              <div style={{ color: '#4ec9b0' }}>
                [{log.timestamp}]
              </div>
              <div style={{ color: '#dcdcaa', marginTop: '5px' }}>
                {log.message}
              </div>
              {log.data && Object.keys(log.data).length > 0 && (
                <pre style={{ 
                  color: '#ce9178', 
                  marginTop: '5px',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}>
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px' }}>
        <p><strong>Hướng dẫn:</strong></p>
        <ul>
          <li>Mở trang này TRƯỚC KHI đăng nhập: <code>http://localhost/debug-logs</code></li>
          <li>Mở tab mới → đăng nhập</li>
          <li>Quay lại tab này để xem logs (tự động refresh)</li>
          <li>Hoặc sau khi bị văng, vào <code>http://localhost/debug-logs</code> để xem logs đã lưu</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugLogs;
