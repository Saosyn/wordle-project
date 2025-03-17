import validWords from '../data/validWords';

export function getRandomWord() {
  const randomIndex = Math.floor(Math.random() * validWords.length);
  return validWords[randomIndex];
}

export function isValidWord(word) {
  return validWords.includes(word);
}
