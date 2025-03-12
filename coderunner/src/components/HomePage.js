import React from 'react';

const HomePage = ({ onSelectLevel }) => {
  return (
    <div className="home-page">
      <h1>CodeRunner - DSA Game</h1>
      <h2>Select a Level</h2>
      <div className="level-selection">
        <button className="level-button" onClick={() => onSelectLevel('level1')}>
          World 1 : Arrays and Strings
        </button>
        <button className="level-button" onClick={() => onSelectLevel('level2')}>
          World 2: Binary Trees
        </button>
        <button className="level-button" onClick={() => onSelectLevel('level3')}>
          World 3: Stacks and Queues
        </button>
      </div>
    </div>
  );
};

export default HomePage;