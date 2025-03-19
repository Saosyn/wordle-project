import fiveLetterWords from '../data/fiveLetterWords.js';
import sixLetterWords from '../data/sixLetterWords.js';
import sevenLetterWords from '../data/sevenLetterWords.js';

export function getRandomWord(difficulty = 'easy') {
  let wordList;
  if (difficulty === 'easy') {
    wordList = fiveLetterWords;
  } else if (difficulty === 'medium') {
    wordList = sixLetterWords;
  } else if (difficulty === 'hard') {
    wordList = sevenLetterWords;
  } else {
    // Fallback to five-letter words if the difficulty isn't recognized.
    wordList = fiveLetterWords;
  }
  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex];
}

export function isValidWord(word, difficulty = 'easy') {
  let wordList;
  if (difficulty === 'easy') {
    wordList = fiveLetterWords;
  } else if (difficulty === 'medium') {
    wordList = sixLetterWords;
  } else if (difficulty === 'hard') {
    wordList = sevenLetterWords;
  } else {
    wordList = fiveLetterWords;
  }
  const normalizedWord = word.trim().toLowerCase();
  console.log('Validating:', normalizedWord, 'against', wordList);
  return wordList.includes(normalizedWord);
}
