const assert = require('assert');

const { calculateStats } = require('./logic/stats');

function testCalculateStats() {
  console.log('Testing calculateStats...');

  // Test 1: Normal case
  const stats1 = calculateStats("hello world", Date.now() - 60000, 0);
  assert(stats1.wpm > 0, 'WPM should be positive');
  assert(stats1.accuracy === 100, 'Accuracy should be 100%');

  // Test 2: Undefined input (should not throw)
  try {
    const stats2 = calculateStats(undefined, Date.now(), 0);
    assert(stats2.wpm === 0, 'WPM should be 0 for empty input');
    console.log('Undefined input test passed');
  } catch (e) {
    console.error('Undefined input test FAILED:', e.message);
    process.exit(1);
  }

  // Test 3: Null input
  try {
    const stats3 = calculateStats(null, Date.now(), 0);
    assert(stats3.wpm === 0, 'WPM should be 0 for null input');
    console.log('Null input test passed');
  } catch (e) {
    console.error('Null input test FAILED:', e.message);
    process.exit(1);
  }

  console.log('All tests passed');
}

testCalculateStats();
