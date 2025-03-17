import React, { useEffect, useState } from 'react';
import { Wordle, GREEN, YELLOW, BLACK } from '../classes/Wordle';
import { getRandomWord, isValidWord } from '../utils/wordHelper';

const WordleGame = () => {
  const [targetWord, setTargetWord] = useState('');
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState([]);
  const wordleInstance = new Wordle('alert'); // Or dynamically set the word

  useEffect(() => {
    const randomWord = getRandomWord();
    setTargetWord(randomWord);
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = wordleInstance.checkWord(guess);
    setFeedback(result);
    setGuess('');
  };

  return (
    <div>
      <h1>Wordle Game</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          maxLength={wordleInstance.word.length}
        />
        <button type="submit">Submit Guess</button>
      </form>
      <div>
        {feedback.length > 0 &&
          feedback.map((res, index) => <span key={index}>{res}</span>)}
      </div>
    </div>
  );
};

export default WordleGame;
