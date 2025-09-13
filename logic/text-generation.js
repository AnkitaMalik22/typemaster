// Text/quote generation for different modes
const wordlists = {
  english: [
    'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'cat', 'run',
    'jump', 'play', 'sun', 'moon', 'star', 'hello', 'world', 'test', 'type', 'fast',
    'slow', 'good', 'bad', 'yes', 'no', 'time', 'love', 'life', 'work', 'home',
    'water', 'earth', 'fire', 'wind', 'light', 'dark', 'green', 'blue', 'red', 'yellow',
    'big', 'small', 'tall', 'short', 'wide', 'thin', 'thick', 'deep', 'high', 'low'
  ]
};

const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" }
];

function generateText(mode, wordLimit, punctuation, numbers, customText) {
  if (mode === 'custom') return customText;
  if (mode === 'quote') {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    return quote.text;
  }
  if (mode === 'zen') return '';

  const words = wordlists.english;
  if (!words || words.length === 0) {
    return 'the quick brown fox jumps over the lazy dog';
  }

  let text = '';
  const limit = mode === 'time' ? 50 : Math.min(wordLimit, 20);

  for (let i = 0; i < limit; i++) {
    let word = words[Math.floor(Math.random() * words.length)];
    if (punctuation && Math.random() < 0.15) {
      word += ['.', ',', '!', '?', ';', ':'][Math.floor(Math.random() * 6)];
    }
    if (numbers && Math.random() < 0.1) {
      word = Math.floor(Math.random() * 1000).toString();
    }
    text += word + ' ';
  }
  return text.trim();
}

module.exports = { generateText };
