// StartAutomationButton.jsx
import axios from 'axios';
import { useState } from 'react';

export default function StartAutomationButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('/api/automation/start');
      setResult(res.data || 'Đã bắt đầu automation!');
    } catch (err) {
      setResult('Lỗi: ' + (err?.message || 'Không xác định'));
    }
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: '8px 24px',
          background: '#1976d2',
          color: '#fff',
          border: 0,
          borderRadius: 5,
        }}
      >
        {loading ? 'Đang chạy...' : 'Start Automation'}
      </button>
      {result && (
        <div style={{ marginTop: 10 }}>
          {typeof result === 'string' ? result : JSON.stringify(result)}
        </div>
      )}
    </div>
  );
}
