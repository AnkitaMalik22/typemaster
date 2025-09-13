// Statistics calculation and formatting
function calculateStats(userInput, startTime, errors) {
  const endTime = Date.now();
  const duration = startTime ? (endTime - startTime) / 1000 : 0;
  const charsTyped = userInput.length;
  const wordsTyped = charsTyped / 5;
  const wpm = duration > 0 ? (wordsTyped / (duration / 60)) : 0;
  const cpm = duration > 0 ? (charsTyped / (duration / 60)) : 0;
  const accuracy = charsTyped > 0 ? ((charsTyped - errors) / charsTyped) * 100 : 100;
  return { wpm, cpm, accuracy, duration, errors };
}

module.exports = { calculateStats };
