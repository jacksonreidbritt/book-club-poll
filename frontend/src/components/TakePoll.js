import React, { useState, useEffect } from 'react';
import { pollAPI } from '../api';
import './TakePoll.css';

function TakePoll({ pollId, onBack, onViewResults }) {
  const [poll, setPoll] = useState(null);
  const [responses, setResponses] = useState({});
  const [respondentName, setRespondentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollId]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const response = await pollAPI.getPoll(pollId);
      setPoll(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load poll');
      console.error('Error fetching poll:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionIndex, value) => {
    setResponses({
      ...responses,
      [questionIndex]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all questions are answered
    if (poll.questions.length !== Object.keys(responses).length) {
      setError('Please answer all questions');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await pollAPI.submitResponse(pollId, {
        responses,
        respondent_name: respondentName.trim() || 'Anonymous'
      });

      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit response. Please try again.');
      console.error('Error submitting response:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading poll...</div>;
  }

  if (error && !poll) {
    return (
      <div className="error-container">
        <p className="error">{error}</p>
        <button onClick={onBack}>Back to Polls</button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h2>Thank You!</h2>
        <p>Your response has been recorded.</p>
        <div className="success-actions">
          <button onClick={onBack} className="btn-primary">
            Back to Polls
          </button>
          <button onClick={() => onViewResults(pollId)} className="btn-secondary">
            View Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="take-poll">
      <button onClick={onBack} className="back-button">← Back</button>
      
      <h2>{poll.title}</h2>
      {poll.description && <p className="poll-description">{poll.description}</p>}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Your Name (Optional)</label>
          <input
            type="text"
            id="name"
            value={respondentName}
            onChange={(e) => setRespondentName(e.target.value)}
            placeholder="Anonymous"
          />
        </div>

        <div className="questions-list">
          {poll.questions.map((question, index) => (
            <div key={index} className="question-item">
              <label className="question-label">
                {index + 1}. {question.question}
              </label>

              {question.type === 'multiple_choice' && (
                <div className="options-list">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="option-label">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={responses[index] === option}
                        onChange={(e) => handleResponseChange(index, e.target.value)}
                        required
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'text' && (
                <textarea
                  value={responses[index] || ''}
                  onChange={(e) => handleResponseChange(index, e.target.value)}
                  placeholder="Enter your answer..."
                  rows="4"
                  required
                />
              )}

              {question.type === 'rating' && (
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="rating-label">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={rating}
                        checked={responses[index] === String(rating)}
                        onChange={(e) => handleResponseChange(index, e.target.value)}
                        required
                      />
                      <span className="rating-number">{rating}</span>
                    </label>
                  ))}
                  <div className="rating-labels">
                    <span>Lowest</span>
                    <span>Highest</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Response'}
        </button>
      </form>
    </div>
  );
}

export default TakePoll;
