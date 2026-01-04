import React, { useState, useEffect } from 'react';
import './App.css';
import PollList from './components/PollList';
import CreatePoll from './components/CreatePoll';
import TakePoll from './components/TakePoll';
import PollResults from './components/PollResults';

function App() {
  const [view, setView] = useState('list'); // 'list', 'create', 'take', 'results'
  const [selectedPollId, setSelectedPollId] = useState(null);

  const handleViewPoll = (pollId) => {
    setSelectedPollId(pollId);
    setView('take');
  };

  const handleViewResults = (pollId) => {
    setSelectedPollId(pollId);
    setView('results');
  };

  const handleBackToList = () => {
    setSelectedPollId(null);
    setView('list');
  };

  const handlePollCreated = () => {
    setView('list');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📚 Book Club Poll</h1>
        <nav className="nav">
          <button 
            onClick={() => setView('list')} 
            className={view === 'list' ? 'active' : ''}
          >
            Polls
          </button>
          <button 
            onClick={() => setView('create')} 
            className={view === 'create' ? 'active' : ''}
          >
            Create Poll
          </button>
        </nav>
      </header>

      <main className="App-main">
        {view === 'list' && (
          <PollList 
            onViewPoll={handleViewPoll}
            onViewResults={handleViewResults}
          />
        )}
        
        {view === 'create' && (
          <CreatePoll 
            onPollCreated={handlePollCreated}
            onCancel={handleBackToList}
          />
        )}
        
        {view === 'take' && selectedPollId && (
          <TakePoll 
            pollId={selectedPollId}
            onBack={handleBackToList}
            onViewResults={handleViewResults}
          />
        )}
        
        {view === 'results' && selectedPollId && (
          <PollResults 
            pollId={selectedPollId}
            onBack={handleBackToList}
          />
        )}
      </main>
    </div>
  );
}

export default App;
