const assert = require('assert');

// Test stats calculation
function testCalculateStats() {
  // Mock data
  const target = "hello world";
  const userInput = "hello world";
  const startTime = Date.now() - 60000; // 1 minute ago
  const errors = 0;

  // Calculate
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000 / 60;
  const charsTyped = userInput.length;
  const wordsTyped = charsTyped / 5;
  const wpm = duration > 0 ? wordsTyped / duration : 0;
  const cpm = charsTyped / duration;
  const accuracy = charsTyped > 0 ? ((charsTyped - errors) / charsTyped) * 100 : 100;

  assert(wpm > 0, 'WPM should be positive');
  assert(accuracy === 100, 'Accuracy should be 100% for perfect input');
  console.log('Stats test passed');
}

testCalculateStats();
