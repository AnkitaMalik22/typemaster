// Statistics calculation and formatting
function calculateStats(userInput = '', startTime = Date.now(), errors = 0) {
  // Safety checks
  if (typeof userInput !== 'string') userInput = '';
  if (!startTime) startTime = Date.now();
  if (errors === undefined || errors === null) errors = 0;

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  const charsTyped = userInput.length;
  const wordsTyped = charsTyped / 5;
  const wpm = duration > 0 ? (wordsTyped / (duration / 60)) : 0;
  const cpm = duration > 0 ? (charsTyped / (duration / 60)) : 0;
  const accuracy = charsTyped > 0 ? ((charsTyped - errors) / charsTyped) * 100 : 100;
  return { wpm, cpm, accuracy, duration, errors };
}

module.exports = { calculateStats };
