import React, { useState, useEffect, useRef } from 'react';
import { Wordle, GREEN, YELLOW, BLACK } from '../classes/Wordle';
import { getRandomWord, isValidWord } from '../utils/wordHelper';

// ---------- Keyboard State and Layout ----------
const createInitialKeyboardState = () => {
  const state = {};
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((letter) => {
    state[letter] = ''; // no color initially
  });
  return state;
};

const initialKeyboardState = createInitialKeyboardState();

const qwertyRows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const updateKeyboardState = (currentKeyboard, guess, feedback) => {
  const newKeyboard = { ...currentKeyboard };
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i].toUpperCase();
    const fb = feedback[i];
    let newColor = '';
    if (fb === GREEN) newColor = 'green';
    else if (fb === YELLOW) newColor = 'gold';
    else if (fb === BLACK) newColor = 'grey';

    const currentColor = newKeyboard[letter];
    // If letter is already green, don't downgrade it.
    if (currentColor === 'green') continue;
    if (newColor === 'green') newKeyboard[letter] = newColor;
    else if (newColor === 'gold' && currentColor !== 'green')
      newKeyboard[letter] = newColor;
    else if (newColor === 'grey' && !currentColor)
      newKeyboard[letter] = newColor;
  }
  return newKeyboard;
};

// ---------- High Score Functions ----------
const HIGH_SCORES_KEY = 'wordleHighScores';

const getHighScores = () => {
  const scores = localStorage.getItem(HIGH_SCORES_KEY);
  return scores ? JSON.parse(scores) : { easy: [], medium: [], hard: [] };
};

const saveHighScores = (highScores) => {
  localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
};

const updateHighScores = (difficulty, newScoreData) => {
  const highScores = getHighScores();
  const scores = highScores[difficulty] || [];
  scores.push(newScoreData);
  // Higher score is better
  scores.sort((a, b) => b.score - a.score);
  highScores[difficulty] = scores.slice(0, 5);
  saveHighScores(highScores);
};

const calculateScore = (guesses, timeInSeconds, wordLength) => {
  const baseScore = wordLength * 1000;
  const guessPenalty = guesses * 100;
  const timePenalty = timeInSeconds * 2;
  const score = baseScore - guessPenalty - timePenalty;
  return score > 0 ? score : 0;
};

// ---------- Main WordleGame Component ----------
const WordleGame = () => {
  const [difficulty, setDifficulty] = useState('easy');
  const [targetWord, setTargetWord] = useState('');
  const [guess, setGuess] = useState('');
  const [guessRows, setGuessRows] = useState([]); // Each element: { guess: string, feedback: [] }
  const [error, setError] = useState('');
  const [keyboardState, setKeyboardState] = useState(initialKeyboardState);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showHighScores, setShowHighScores] = useState(false);
  const [highScores, setHighScores] = useState(getHighScores());

  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Start a new game using the selected difficulty
  const startNewGame = () => {
    const randomWord = getRandomWord(difficulty);
    setTargetWord(randomWord);
    setGuess('');
    setGuessRows([]);
    setError('');
    setKeyboardState(createInitialKeyboardState());
    setGameOver(false);
    setScore(null);
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  // When difficulty changes, start a new game
  useEffect(() => {
    startNewGame();
  }, [difficulty]);

  // Stop the timer when game is over
  useEffect(() => {
    if (gameOver && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, [gameOver]);

  // Check for win condition: if the last guess matches the target word
  useEffect(() => {
    if (
      guessRows.length > 0 &&
      guessRows[guessRows.length - 1].guess === targetWord
    ) {
      setGameOver(true);
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const guessesCount = guessRows.length;
      const calculatedScore = calculateScore(
        guessesCount,
        timeTaken,
        targetWord.length
      );
      setScore(calculatedScore);
      updateHighScores(difficulty, {
        score: calculatedScore,
        guesses: guessesCount,
        time: timeTaken,
        date: new Date().toISOString(),
      });
      setHighScores(getHighScores());
    }
  }, [guessRows, targetWord, difficulty]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (gameOver) return;
    if (guess.length !== targetWord.length) {
      setError(`Please enter a ${targetWord.length}-letter word.`);
      return;
    }
    if (!isValidWord(guess, difficulty)) {
      setError(
        `Invalid word! Please try a valid ${targetWord.length}-letter word.`
      );
      return;
    }
    setError('');
    const wordleInstance = new Wordle(targetWord);
    const feedback = wordleInstance.checkWord(guess);
    setGuessRows([...guessRows, { guess, feedback }]);
    const updatedKeyboard = updateKeyboardState(keyboardState, guess, feedback);
    setKeyboardState(updatedKeyboard);
    setGuess('');
  };

  const feedbackColor = (fb) => {
    if (fb === GREEN) return 'green';
    if (fb === YELLOW) return 'gold';
    if (fb === BLACK) return 'grey';
    return 'lightgray';
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '10px' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1>Wordle Game</h1>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Difficulty:&nbsp;
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy (5 letters)</option>
              <option value="medium">Medium (6 letters)</option>
              <option value="hard">Hard (7 letters)</option>
            </select>
          </label>
        </div>
        <button onClick={startNewGame} style={{ padding: '8px 16px' }}>
          New Game
        </button>
      </header>

      {/* Timer Display */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: '1.1rem',
        }}
      >
        Time: {elapsedTime} sec
      </div>

      {/* Guess List */}
      <div
        style={{
          maxHeight: '40vh',
          overflowY: 'auto',
          padding: '10px',
          marginBottom: '10px',
          background: guessRows.length > 0 ? '#242424' : 'transparent',
        }}
      >
        {guessRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '5px',
            }}
          >
            {row.guess.split('').map((letter, index) => (
              <div
                key={index}
                style={{
                  width: '40px',
                  height: '40px',
                  lineHeight: '40px',
                  margin: '5px',
                  textAlign: 'center',
                  backgroundColor: feedbackColor(row.feedback[index]),
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                }}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Input Field (moves with the guesses) */}
      <div
        style={{
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexGrow: 1 }}>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value.toLowerCase())}
            autoCapitalize="none"
            maxLength={targetWord.length}
            placeholder="Type your guess"
            style={{
              fontSize: '1.2rem',
              padding: '8px',
              flex: 1,
              marginRight: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: 'black',
            }}
          />
          <button type="submit" style={{ padding: '8px 16px' }}>
            Submit
          </button>
        </form>
      </div>
      {error && (
        <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>
          {error}
        </p>
      )}

      {/* High Scores Dropdown */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <button
          onClick={() => setShowHighScores(!showHighScores)}
          style={{ padding: '6px 12px' }}
        >
          {showHighScores ? 'Hide High Scores' : 'Show High Scores'}
        </button>
        {showHighScores && (
          <div
            style={{
              marginTop: '5px',
              background: '#2d323b',
              padding: '10px',
              borderRadius: '4px',
            }}
          >
            <h2>High Scores ({difficulty})</h2>
            {highScores[difficulty] && highScores[difficulty].length > 0 ? (
              <ol style={{ paddingLeft: '20px', margin: 0 }}>
                {highScores[difficulty].map((entry, index) => (
                  <li key={index} style={{ marginBottom: '3px' }}>
                    Score: {entry.score} - Guesses: {entry.guesses} - Time:{' '}
                    {entry.time} sec -{' '}
                    {new Date(entry.date).toLocaleDateString()}
                  </li>
                ))}
              </ol>
            ) : (
              <p>No high scores yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Keyboard Display */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <h2>Keyboard</h2>
        {qwertyRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '5px',
            }}
          >
            {row.map((letter) => (
              <div
                key={letter}
                style={{
                  width: '40px',
                  height: '40px',
                  lineHeight: '40px',
                  margin: '3px',
                  textAlign: 'center',
                  backgroundColor: keyboardState[letter] || 'lightgray',
                  color: '#2d323b',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                }}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordleGame;
