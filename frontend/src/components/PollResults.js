import React, { useState, useEffect } from 'react';
import { pollAPI } from '../api';
import './PollResults.css';

function PollResults({ pollId, onBack }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, [pollId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await pollAPI.getResults(pollId);
      setResults(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load results');
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (count, total) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const calculateAverageRating = (answers) => {
    const ratings = Object.entries(answers).map(([rating, count]) => 
      parseInt(rating) * count
    );
    const totalRatings = Object.values(answers).reduce((sum, count) => sum + count, 0);
    if (totalRatings === 0) return 0;
    return (ratings.reduce((sum, val) => sum + val, 0) / totalRatings).toFixed(1);
  };

  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error">{error}</p>
        <button onClick={onBack}>Back to Polls</button>
      </div>
    );
  }

  return (
    <div className="poll-results">
      <button onClick={onBack} className="back-button">← Back</button>
      
      <div className="results-header">
        <h2>{results.poll_title}</h2>
        <p className="total-responses">
          Total Responses: <strong>{results.total_responses}</strong>
        </p>
      </div>

      {results.total_responses === 0 ? (
        <div className="no-responses">
          <p>No responses yet. Be the first to take this poll!</p>
        </div>
      ) : (
        <div className="questions-results">
          {results.questions.map((question, index) => (
            <div key={index} className="question-result">
              <h3 className="question-title">
                {index + 1}. {question.question}
              </h3>

              {question.type === 'multiple_choice' && (
                <div className="multiple-choice-results">
                  {Object.entries(question.answers).map(([answer, count]) => {
                    const percentage = calculatePercentage(count, results.total_responses);
                    return (
                      <div key={answer} className="answer-bar">
                        <div className="answer-label">
                          <span>{answer}</span>
                          <span className="answer-count">{count} ({percentage}%)</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {question.type === 'rating' && (
                <div className="rating-results">
                  <div className="average-rating">
                    <span className="rating-value">
                      {calculateAverageRating(question.answers)}
                    </span>
                    <span className="rating-max">/ 5.0</span>
                  </div>
                  <div className="rating-breakdown">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = question.answers[rating] || 0;
                      const percentage = calculatePercentage(count, results.total_responses);
                      return (
                        <div key={rating} className="rating-bar">
                          <span className="rating-label">{rating} ★</span>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="rating-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {question.type === 'text' && (
                <div className="text-responses">
                  {question.text_responses && question.text_responses.length > 0 ? (
                    question.text_responses.map((response, idx) => (
                      <div key={idx} className="text-response">
                        <p>"{response}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="no-text-responses">No responses yet</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PollResults;
