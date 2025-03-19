import React, { useState, useEffect } from 'react';
import { Wordle, GREEN, YELLOW, BLACK } from '../classes/Wordle';
import { getRandomWord, isValidWord } from '../utils/wordHelper';

const createInitialKeyboardState = () => {
  const state = {};
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((letter) => {
    state[letter] = ''; // no color initially
  });
  return state;
};

const initialKeyboardState = createInitialKeyboardState();

// Helper function to update the keyboard state based on the latest guess feedback.
// Priority: green > yellow > grey.
const updateKeyboardState = (currentKeyboard, guess, feedback) => {
  const newKeyboard = { ...currentKeyboard };
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i].toUpperCase();
    const fb = feedback[i];
    let newColor = '';
    if (fb === GREEN) {
      newColor = 'green';
    } else if (fb === YELLOW) {
      newColor = 'gold';
    } else if (fb === BLACK) {
      newColor = 'grey';
    }
    const currentColor = newKeyboard[letter];
    // Update color only if new color is a "better" state.
    if (currentColor === 'green') continue;
    if (newColor === 'green') {
      newKeyboard[letter] = newColor;
    } else if (newColor === 'gold' && currentColor !== 'green') {
      newKeyboard[letter] = newColor;
    } else if (newColor === 'grey' && !currentColor) {
      newKeyboard[letter] = newColor;
    }
  }
  return newKeyboard;
};

// QWERTY layout rows for the keyboard.
const qwertyRows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const WordleGame = () => {
  const [targetWord, setTargetWord] = useState('');
  const [guess, setGuess] = useState('');
  const [guessRows, setGuessRows] = useState([]); // Each element: { guess: string, feedback: [] }
  const [error, setError] = useState('');
  const [keyboardState, setKeyboardState] = useState(initialKeyboardState);

  // Function to start a new game by resetting state.
  const startNewGame = () => {
    const randomWord = getRandomWord();
    setTargetWord(randomWord);
    setGuess('');
    setGuessRows([]);
    setError('');
    setKeyboardState(createInitialKeyboardState());
  };

  // On component mount, start a new game.
  useEffect(() => {
    startNewGame();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidWord(guess)) {
      setError('Invalid word! Please try a valid five-letter word.');
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
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1>Wordle Game</h1>
      <button
        onClick={startNewGame}
        style={{ marginBottom: '20px', padding: '8px 16px' }}
      >
        New Game
      </button>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toLowerCase())}
          maxLength={targetWord.length}
          style={{
            fontSize: '1.2rem',
            padding: '5px',
            textTransform: 'lowercase',
          }}
        />
        <button type="submit" style={{ marginLeft: '10px' }}>
          Submit Guess
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* Display previous guesses */}
      <div style={{ marginTop: '20px' }}>
        {guessRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '10px',
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
      {/* Render the keyboard */}
      <Keyboard keyboardState={keyboardState} />
    </div>
  );
};

// Updated Keyboard component using QWERTY layout.
const Keyboard = ({ keyboardState }) => {
  return (
    <div style={{ marginTop: '30px' }}>
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
                color: 'white',
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
  );
};

export default WordleGame;
