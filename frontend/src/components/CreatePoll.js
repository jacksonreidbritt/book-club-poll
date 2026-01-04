import React, { useState } from 'react';
import { pollAPI } from '../api';
import './CreatePoll.css';

function CreatePoll({ onPollCreated, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    {
      question: '',
      type: 'multiple_choice',
      options: ['']
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        type: 'multiple_choice',
        options: ['']
      }
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!title.trim()) {
      setError('Please enter a poll title');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        setError(`Please enter text for question ${i + 1}`);
        return;
      }
      if (questions[i].type === 'multiple_choice' && questions[i].options.filter(o => o.trim()).length < 2) {
        setError(`Question ${i + 1} needs at least 2 options`);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      
      const pollData = {
        title: title.trim(),
        description: description.trim(),
        questions: questions.map(q => ({
          question: q.question.trim(),
          type: q.type,
          options: q.type === 'multiple_choice' ? q.options.filter(o => o.trim()) : undefined
        })),
        active: true
      };

      await pollAPI.createPoll(pollData);
      onPollCreated();
    } catch (err) {
      setError('Failed to create poll. Please try again.');
      console.error('Error creating poll:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-poll">
      <h2>Create New Poll</h2>
      <p className="subtitle">Create custom polls for your book club with questions like "What was your favorite book?" or "How would you rate this book?"</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Poll Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Monthly Book Selection"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional: Add a description for this poll"
            rows="3"
          />
        </div>

        <div className="questions-section">
          <div className="section-header">
            <h3>Questions</h3>
            <button type="button" onClick={addQuestion} className="btn-add">
              + Add Question
            </button>
          </div>

          {questions.map((question, qIndex) => (
            <div key={qIndex} className="question-card">
              <div className="question-header">
                <h4>Question {qIndex + 1}</h4>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  placeholder="e.g., What was your favorite book this month?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Question Type</label>
                <select
                  value={question.type}
                  onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="text">Text Answer</option>
                  <option value="rating">Rating (1-5)</option>
                </select>
              </div>

              {question.type === 'multiple_choice' && (
                <div className="options-section">
                  <label>Options *</label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="option-row">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                      />
                      {question.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="btn-remove-small"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="btn-add-option"
                  >
                    + Add Option
                  </button>
                </div>
              )}

              {question.type === 'rating' && (
                <div className="rating-info">
                  <small>Users will rate from 1 (lowest) to 5 (highest)</small>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePoll;
