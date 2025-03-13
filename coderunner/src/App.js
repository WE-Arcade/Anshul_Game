import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import Game from './components/Game';
import Level2 from './components/Level2';
import Level3 from './components/Level3';
import StackQueueGame from './components/stacks';
import './styles.css';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // Tracks the current page: 'landing', 'home', 'level1', 'level2', 'level3'

  const handleProceed = () => {
    setCurrentPage('home');
  };

  const handleSelectLevel = (level) => {
    setCurrentPage(level);
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  return (
    <div className="app">
      {currentPage === 'landing' && <LandingPage onProceed={handleProceed} />}
      {currentPage === 'home' && <HomePage onSelectLevel={handleSelectLevel} />}
      {currentPage === 'level1' && <Level2 onBack={handleBackToHome} />}
      {currentPage === 'level2' && <Game onBack={handleBackToHome} />}
      {currentPage === 'level3' && <StackQueueGame onBack={handleBackToHome} />}
    </div>
  );
}

export default App;