import { useState, useEffect } from 'react';
import socket from '../socket';
import '../styles/CategoryVote.css';

// Category info matching server definition
const CATEGORY_INFO = {
  DATA_STRUCTURES: {
    emoji: '🔗',
    name: 'Data Structures',
    description: 'Work with stacks, queues, and linked lists',
    color: '#FF6B6B'
  },
  OOP: {
    emoji: '🏗️',
    name: 'OOP',
    description: 'Classes, inheritance, and polymorphism',
    color: '#4ECDC4'
  },
  SECURITY: {
    emoji: '🔒',
    name: 'Security',
    description: 'Prevent vulnerabilities and attacks',
    color: '#95E1D3'
  },
  FRONTEND: {
    emoji: '🎨',
    name: 'Frontend',
    description: 'DOM, CSS, and React challenges',
    color: '#FFE66D'
  },
  ALGORITHMS: {
    emoji: '⚡',
    name: 'Algorithms',
    description: 'Sorting, searching, and optimization',
    color: '#FF8C42'
  },
  DATABASES: {
    emoji: '🗄️',
    name: 'Databases',
    description: 'SQL, queries, and data modeling',
    color: '#A8E6CF'
  }
};

export default function CategoryVote({ gameState, setGameState }) {
  const [votes, setVotes] = useState({});
  const [playerVotes, setPlayerVotes] = useState({});
  const [timeLeft, setTimeLeft] = useState(15);
  const [myVotes, setMyVotes] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorySelected, setCategorySelected] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const categories = Object.keys(CATEGORY_INFO);
  const myPlayerId = gameState.player?.id;

  useEffect(() => {
    // Listen for category voting events
    socket.on('category_vote_update', ({ votes: newVotes, playerVotes: newPlayerVotes }) => {
      setVotes(newVotes);
      setPlayerVotes(newPlayerVotes);
    });

    socket.on('category_selected', ({ category, reason }) => {
      setCategorySelected(category);
      setShowAnimation(true);
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          screen: 'roleReveal',
          selectedCategory: category
        }));
      }, 3000);
    });

    return () => {
      socket.off('category_vote_update');
      socket.off('category_selected');
    };
  }, [setGameState]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVoteCategory = (categoryId) => {
    if (myVotes < 2) {
      setMyVotes(prev => prev + 1);
      setSelectedCategory(categoryId);
      socket.emit('cast_category_vote', {
        roomId: gameState.roomCode,
        playerId: myPlayerId,
        categoryId
      });
    }
  };

  // Get players who voted for a category
  const getPlayersForCategory = (categoryId) => {
    return gameState.players?.filter(
      (p) => playerVotes && playerVotes[p.id] === categoryId
    ) || [];
  };

  const getCategoryVotes = (categoryId) => {
    return votes[categoryId] || 0;
  };

  const getLeadingCategory = () => {
    let leading = null;
    let maxVotes = 0;
    for (const [cat, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        leading = cat;
      }
    }
    return leading;
  };

  const leadingCategory = getLeadingCategory();

  if (showAnimation && categorySelected) {
    const selectedInfo = CATEGORY_INFO[categorySelected];
    return (
      <div className="category-vote-screen">
        <div className="category-selection-animation">
          <div className="celebration">
            <span>🎉</span>
            <span>🎉</span>
            <span>🎉</span>
          </div>
          <div className="selected-category-display">
            <div className="category-emoji">{selectedInfo.emoji}</div>
            <h1>{selectedInfo.name}</h1>
            <p>Selected for this round!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-vote-screen">
      <div className="category-vote-header">
        <h1>Vote for a Category!</h1>
        <div className="timer">
          <div className={`time-display ${timeLeft <= 5 ? 'warning' : ''}`}>{timeLeft}s</div>
        </div>
        <div className="votes-remaining">
          Votes Remaining: <span className="vote-count">{2 - myVotes}</span>/2
        </div>
      </div>

      <div className="categories-grid">
        {categories.map((categoryKey) => {
          const categoryInfo = CATEGORY_INFO[categoryKey];
          const isLeading = leadingCategory === categoryKey;
          const isSelected = selectedCategory === categoryKey;
          const playersForCat = getPlayersForCategory(categoryKey);
          return (
            <div
              key={categoryKey}
              className={`category-card${isLeading ? ' leading' : ''}${isSelected ? ' selected' : ''}`}
            >
              <div className="category-emoji">{categoryInfo.emoji}</div>
              <h2>{categoryInfo.name}</h2>
              <p className="category-description">{categoryInfo.description}</p>
              <div className="vote-bar">
                <div
                  className="vote-fill"
                  style={{ width: `${Math.min(getCategoryVotes(categoryKey) * 20, 100)}%` }}
                />
              </div>
              <div className="vote-count">{getCategoryVotes(categoryKey)} votes</div>
              <button
                className="vote-btn"
                disabled={isSelected || myVotes >= 2}
                onClick={() => handleVoteCategory(categoryKey)}
              >
                {isSelected ? 'VOTED' : 'VOTE'}
              </button>
              <div className="player-avatars" style={{ marginTop: 10 }}>
                {playersForCat.map((player) => (
                  <div
                    key={player.id}
                    className="player-avatar"
                    title={player.name}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
