import React, { useState, useEffect } from 'react';
import { pollAPI } from '../api';
import './PollList.css';

function PollList({ onViewPoll, onViewResults }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await pollAPI.getAllPolls();
      setPolls(response.data.polls || []);
      setError(null);
    } catch (err) {
      setError('Failed to load polls. Make sure the backend is running.');
      console.error('Error fetching polls:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading polls...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error">{error}</p>
        <button onClick={fetchPolls}>Retry</button>
      </div>
    );
  }

  return (
    <div className="poll-list">
      <h2>Available Polls</h2>
      {polls.length === 0 ? (
        <p className="no-polls">No polls available. Create one to get started!</p>
      ) : (
        <div className="polls-grid">
          {polls.map((poll) => (
            <div key={poll.id} className="poll-card">
              <h3>{poll.title}</h3>
              {poll.description && <p className="poll-description">{poll.description}</p>}
              <div className="poll-meta">
                <span className="question-count">
                  {poll.questions?.length || 0} questions
                </span>
                <span className={`poll-status ${poll.active ? 'active' : 'inactive'}`}>
                  {poll.active ? 'Active' : 'Closed'}
                </span>
              </div>
              <div className="poll-actions">
                <button onClick={() => onViewPoll(poll.id)} className="btn-primary">
                  Take Poll
                </button>
                <button onClick={() => onViewResults(poll.id)} className="btn-secondary">
                  View Results
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PollList;
