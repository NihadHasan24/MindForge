import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { server } from '../../main';

const Leaderboard = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${server}/api/leaderboard`);
        setRows(Array.isArray(data.leaderboard) ? data.leaderboard : []);
      } catch (e) {
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading leaderboard...</div>;
  if (error) return <div style={{ padding: 20 }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Leaderboard</h2>
      {rows.length === 0 ? (
        <p>No quiz results yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>#</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Email</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Total Score</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Total Questions</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Attempts</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.userId}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>{idx + 1}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>{r.name}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>{r.email}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>{r.totalScore}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>{r.totalQuestions}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>{r.attempts}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>{r.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;


