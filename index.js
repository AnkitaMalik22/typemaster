#!/usr/bin/env node


const blessed = require('blessed');
const chalk = require('chalk');
const parseCLI = require('./cli');
const { loadConfig } = require('./config');
const { initDB, saveTest } = require('./database');
const { generateText } = require('./logic/text-generation');
const { calculateStats } = require('./logic/stats');
const { handleInput } = require('./logic/typing');
const fs = require('fs');
const path = require('path');
const os = require('os');
const screen = blessed.screen({
  smartCSR: true,
  title: 'typemaster - Terminal Typing Test',
});
const header = blessed.box({
  top: 0,
  left: 0,
  width: '100%',
  height: 5,
  style: {
    bg: 'black',
    fg: 'white'
  }
});


  

// Force enable colors for cmd.exe compatibility
if (process.platform === 'win32') {
  chalk.level = 1;
} else if (!chalk.supportsColor) {
  chalk.level = 0;
}

const cli = parseCLI();
const config = loadConfig();
const db = initDB();

let currentMode = cli.cliMode || config.defaultMode || 'time';
let timeLimit = cli.cliSeconds || 30;
let wordLimit = cli.cliCount;
let punctuation = cli.cliPunctuation;
let numbers = cli.cliNumbers;
let zenMode = cli.cliZen;
let customText = '';
let startTime = null;
let userInput = '';
let errors = 0;
let targetText = '';
let testCompleted = false;
let timeRemaining = timeLimit;
let timerInterval = null;

if (cli.cliLoad) {
  try {
    customText = fs.readFileSync(cli.cliLoad, 'utf8');
    currentMode = 'custom';
  } catch (e) {
    console.error('Error loading file:', e.message);
    process.exit(1);
  }
}

// Theme colors (simplified for better terminal compatibility)
const theme = {
  bg: 'black',
  primary: 'yellow',    // Yellow accent like Monkeytype
  secondary: 'blue',   // blue
  correct: 'green',    // Light green
  incorrect: 'red',    // Light red
  current: 'white',    // White
  text: 'white',      // Off-white text
  subtext: 'gray'     // Gray subtext
  
// ...existing code...
}
// Initialize function should be at the end of the file
function init() {
  // Show/hide stats panel based on zen mode
  if (zenMode) {
    statsPanel.hide();
  } else {
    statsPanel.show();
  }
  updateModeButtons();
  resetTest();
  // Ensure initial render with a small delay
  setTimeout(() => {
    screen.render();
    setTimeout(() => {
      screen.render();
    }, 100);
  }, 200);
}

  
  // Key event handlers
  screen.key(['C-c'], () => {
    if (db) db.close();
    process.exit(0);
  });

// Logo
const logo = blessed.text({
  parent: header,
  top: 1,
  left: 2,
  content: '🚀 typemaster',
  style: {
    fg: theme.primary,
    bold: true
  }
});

// Mode selector buttons
const modeSelector = blessed.box({
  parent: header,
  top: 1,
  left: 'center',
  width: 40,
  height: 2,
  style: {
    bg: theme.bg
  }
});

// Individual mode buttons
const timeBtn = blessed.text({
  parent: modeSelector,
  top: 0,
  left: 0,
  width: 8,
  height: 1,
  content: ' time ',
  style: {
    fg: currentMode === 'time' ? theme.primary : theme.secondary,
    bg: currentMode === 'time' ? theme.secondary : theme.bg
  },
  clickable: true
});

const wordsBtn = blessed.text({
  parent: modeSelector,
  top: 0,
  left: 10,
  width: 8,
  height: 1,
  content: ' words ',
  style: {
    fg: currentMode === 'words' ? theme.primary : theme.secondary,
    bg: currentMode === 'words' ? theme.secondary : theme.bg
  },
  clickable: true
});

const quoteBtn = blessed.text({
  parent: modeSelector,
  top: 0,
  left: 20,
  width: 8,
  height: 1,
  content: ' quote ',
  style: {
    fg: currentMode === 'quote' ? theme.primary : theme.secondary,
    bg: currentMode === 'quote' ? theme.secondary : theme.bg
  },
  clickable: true
});

const zenBtn = blessed.text({
  parent: modeSelector,
  top: 0,
  left: 30,
  width: 6,
  height: 1,
  content: ' zen ',
  style: {
    fg: currentMode === 'zen' ? theme.primary : theme.secondary,
    bg: currentMode === 'zen' ? theme.secondary : theme.bg
  },
  clickable: true
});

// Main typing area container
const mainContainer = blessed.box({
  top: 6,
  left: 'center',
  width: '80%',
  height: '60%',
  style: {
    bg: theme.bg
  }
});

// Timer/Counter display
const timerDisplay = blessed.text({
  parent: mainContainer,
  top: 0,
  left: 'center',
  width: '100%',
  height: 3,
  content: timeLimit.toString(),
  align: 'center',
  valign: 'middle',
  style: {
    fg: theme.primary,
    bold: true
  }
});

// Test info (mode, settings)
const testInfo = blessed.text({
  parent: mainContainer,
  top: 4,
  left: 'center',
  width: '90%',
  height: 1,
  content: getTestInfoText(),
  align: 'center',
  style: {
    fg: theme.subtext
  }
});

// Typing area with better spacing
const typingArea = blessed.box({
  parent: mainContainer,
  top: 8,
  left: 'center',
  width: '90%',
  height: 12, // Increased height for better text display
  style: {
    bg: theme.bg,
    fg: theme.text
  },
  align: 'center',
  valign: 'middle',
  wrap: true,
  scrollable: true // Allow scrolling for long text
});

// Stats panel (hidden in zen mode)
const statsPanel = blessed.box({
  top: '75%',
  left: 'center',
  width: '70%',
  height: 8,
  style: {
    bg: theme.bg,
    fg: theme.text
  },
  align: 'center',
  hidden: zenMode
});

// Individual stat boxes
const wpmStat = blessed.box({
  parent: statsPanel,
  top: 0,
  left: 0,
  width: '25%',
  height: '100%',
  content: 'wpm\n0',
  align: 'center',
  valign: 'middle',
  style: {
    fg: theme.text
  }
});

const cpmStat = blessed.box({
  parent: statsPanel,
  top: 0,
  left: '25%',
  width: '25%',
  height: '100%',
  content: 'cpm\n0',
  align: 'center',
  valign: 'middle',
  style: {
    fg: theme.text
  }
});

const accuracyStat = blessed.box({
  parent: statsPanel,
  top: 0,
  left: '50%',
  width: '25%',
  height: '100%',
  content: 'acc\n100%',
  align: 'center',
  valign: 'middle',
  style: {
    fg: theme.text
  }
});

const errorStat = blessed.box({
  parent: statsPanel,
  top: 0,
  left: '75%',
  width: '25%',
  height: '100%',
  content: 'errors\n0',
  align: 'center',
  valign: 'middle',
  style: {
    fg: theme.text
  }
});

// Footer with shortcuts
const footer = blessed.box({
  bottom: 0,
  left: 0,
  width: '100%',
  height: 2,
  style: {
    bg: theme.bg,
    fg: theme.subtext
  },
  content: ' tab + enter - restart test   |   esc - quit   |   ctrl+shift+p - command palette',
  align: 'center'
});

// Command palette
const commandPalette = blessed.prompt({
  top: 'center',
  left: 'center',
  width: '60%',
  height: 8,
  style: {
    bg: theme.secondary,
    fg: theme.text,
    focus: {
      bg: theme.primary
    }
  },
  border: {
    type: 'line',
    fg: theme.primary
  },
  label: ' Command Palette ',
  hidden: true
});

// Results modal
const resultsModal = blessed.box({
  top: 'center',
  left: 'center',
  width: 50,
  height: 15,
  style: {
    bg: theme.secondary,
    fg: theme.text
  },
  border: {
    type: 'line',
    fg: theme.primary
  },
  label: ' Test Results ',
  hidden: true
});

// Append elements to screen
screen.append(header);
screen.append(mainContainer);
screen.append(statsPanel);
screen.append(footer);
screen.append(commandPalette);
screen.append(resultsModal);

// ...existing code...

// Get test info text
function getTestInfoText() {
  let info = `${currentMode}`;
  if (currentMode === 'time') info += ` ${timeLimit}s`;
  if (currentMode === 'words') info += ` ${wordLimit}`;
  if (punctuation) info += ' | punctuation';
  if (numbers) info += ' | numbers';
  return info;
}

// ...existing code...

// Update mode button styles
function updateModeButtons() {
  const buttons = { time: timeBtn, words: wordsBtn, quote: quoteBtn, zen: zenBtn };
  
  Object.keys(buttons).forEach(mode => {
    const btn = buttons[mode];
    if (mode === currentMode) {
      btn.style.fg = theme.primary;
      btn.style.bg = theme.secondary;
    } else {
      btn.style.fg = theme.secondary;
      btn.style.bg = theme.bg;
    }
  });
  
  testInfo.setContent(getTestInfoText());
}

// Start timer for time mode
function startTimer() {
  if (currentMode === 'time' && !timerInterval) {
    timeRemaining = timeLimit;
    timerInterval = setInterval(() => {
      timeRemaining--;
      timerDisplay.setContent(`${timeRemaining}`);
      
      if (timeRemaining <= 0) {
        endTest();
      }
      screen.render();
    }, 1000);
  }
}

// End test
function endTest() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  testCompleted = true;
  const stats = calculateStats();
  
  if (db && config.saveHistory) {
    try {
      const stmt = db.prepare('INSERT INTO tests (timestamp, mode, wpm, cpm, accuracy, duration, errors) VALUES (?, ?, ?, ?, ?, ?, ?)');
      stmt.run(new Date().toISOString(), currentMode, stats.wpm, stats.cpm, stats.accuracy, stats.duration, stats.errors);
    } catch (e) {
      // Ignore DB errors
    }
  }
  
  showResults(stats);
}

// Show results modal
function showResults(stats) {
  const content = `
Test Completed!

WPM: ${stats.wpm.toFixed(1)}
CPM: ${stats.cpm.toFixed(1)}
Accuracy: ${stats.accuracy.toFixed(1)}%
Errors: ${stats.errors}
Duration: ${stats.duration.toFixed(1)}s

Press Enter to continue
Press R to restart
`;
  
  resultsModal.setContent(content);
  resultsModal.show();
  resultsModal.focus();
  screen.render();
}

// Update typing display with better visual feedback
function updateTypingDisplay() {
  if (zenMode) {
    typingArea.setContent(''); // No target text in zen mode
    return;
  }
  
  if (!targetText || targetText.length === 0) {
    typingArea.setContent('No text available. Please try a different mode.');
    return;
  }
  
  let displayText = '';
  const words = targetText.split(' ');
  let charIndex = 0;
  
  for (let wordIndex = 0; wordIndex < Math.min(words.length, 20); wordIndex++) {
    const word = words[wordIndex];
    let wordDisplay = '';
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      
      if (charIndex < userInput.length) {
        if (userInput[charIndex] === char) {
          wordDisplay += chalk.green(char); // Correct: green
        } else {
          wordDisplay += chalk.red(char); // Incorrect: red
        }
      } else if (charIndex === userInput.length) {
        wordDisplay += chalk.bgWhite.black(char); // Current: highlighted
      } else {
        wordDisplay += chalk.cyan(char); // Un-typed: cyan
      }
      charIndex++;
    }
    
    displayText += wordDisplay;
    
    if (wordIndex < words.length - 1) {
      if (charIndex < userInput.length) {
        if (userInput[charIndex] === ' ') {
          displayText += chalk.green(' '); // Correct space: green
        } else {
          displayText += chalk.red(' '); // Incorrect space: red
        }
      } else if (charIndex === userInput.length) {
        displayText += chalk.bgWhite.black(' '); // Current space: highlighted
      } else {
        displayText += chalk.cyan(' '); // Un-typed space: cyan
      }
      charIndex++;
    }
    
    // Add line breaks for better readability
    if (wordIndex > 0 && wordIndex % 8 === 0) {
      displayText += '\n';
    }
  }
  
  typingArea.setContent(displayText);
}

// Update real-time stats
function updateStats() {
  if (zenMode || !startTime) return;
  const stats = calculateStats(userInput, startTime, errors);
  wpmStat.setContent(`wpm\n${stats.wpm.toFixed(1)}`);
  cpmStat.setContent(`cpm\n${stats.cpm.toFixed(1)}`);
  accuracyStat.setContent(`acc\n${stats.accuracy.toFixed(1)}%`);
  errorStat.setContent(`errors\n${errors}`);
}

// Update UI
function updateUI() {
  updateTypingDisplay();
  updateStats();
  screen.render();
  setTimeout(() => {
    screen.render();
  }, 50);
}

function resetTest() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  userInput = '';
  startTime = null;
  errors = 0;
  testCompleted = false;
  timeRemaining = timeLimit;
  targetText = generateText(currentMode, wordLimit, punctuation, numbers, customText);
  timerDisplay.setContent(currentMode === 'time' ? `${timeLimit}` : `0`);
  wpmStat.setContent('wpm\n0');
  cpmStat.setContent('cpm\n0');
  accuracyStat.setContent('acc\n100%');
  errorStat.setContent('errors\n0');
  resultsModal.hide();
  updateUI();
}

function init() {
  if (zenMode) {
    statsPanel.hide();
  } else {
    statsPanel.show();
  }
  updateModeButtons();
  resetTest();
  setTimeout(() => {
    screen.render();
    setTimeout(() => {
      screen.render();
    }, 100);
  }, 200);
}

// Start the application
init();

// Key event handlers
screen.key(['C-c'], () => {
  if (db) db.close();
  process.exit(0);
});

screen.key(['tab', 'enter'], () => {
  resetTest();
});

screen.key(['escape'], () => {
  if (resultsModal.visible) {
    resultsModal.hide();
    resetTest();
  } else {
    if (db) db.close();
    process.exit(0);
  }
});

screen.key(['C-S-p'], () => {
  if (!commandPalette.visible) {
    commandPalette.show();
    commandPalette.focus();
    screen.render();
  }
});

// Results modal key handlers
resultsModal.key(['enter', 'r'], () => {
  resultsModal.hide();
  resetTest();
});

// Mode button click handlers
timeBtn.on('click', () => {
  currentMode = 'time';
  zenMode = false;
  statsPanel.show();
  updateModeButtons();
  resetTest();
});

wordsBtn.on('click', () => {
  currentMode = 'words';
  zenMode = false;
  statsPanel.show();
  updateModeButtons();
  resetTest();
});

quoteBtn.on('click', () => {
  currentMode = 'quote';
  zenMode = false;
  statsPanel.show();
  updateModeButtons();
  resetTest();
});

zenBtn.on('click', () => {
  currentMode = 'zen';
  zenMode = true;
  statsPanel.hide();
  updateModeButtons();
  resetTest();
});

// Main input handler
screen.on('keypress', (ch, key) => {
  if (!targetText || testCompleted) return;
  if (key.name === 'tab' || key.name === 'escape' || (key.ctrl && key.shift && key.name === 'p')) return;
  // Start test on first keypress
  if (!startTime) {
    startTime = Date.now();
    if (currentMode === 'time') {
      startTimer();
    }
  }
  const result = handleInput({ ch, key, userInput, targetText, errors, config });
  userInput = result.newInput;
  errors = result.newErrors;
  // Check completion
  if (userInput.length === targetText.length || (currentMode === 'words' && userInput.split(' ').length >= wordLimit)) {
    endTest();
    return;
  }
  updateUI();
});

// Command palette handlers
commandPalette.on('submit', (value) => {
  const cmd = value.toLowerCase().trim();
  
  switch (cmd) {
    case 'restart':
    case 'reset':
      resetTest();
      break;
    case 'toggle punctuation':
      punctuation = !punctuation;
      testInfo.setContent(getTestInfoText());
      resetTest();
      break;
    case 'toggle numbers':
      numbers = !numbers;
      testInfo.setContent(getTestInfoText());
      resetTest();
      break;
    case 'time mode':
      currentMode = 'time';
      updateModeButtons();
      resetTest();
      break;
    case 'words mode':
      currentMode = 'words';
      updateModeButtons();
      resetTest();
      break;
    case 'quote mode':
      currentMode = 'quote';
      updateModeButtons();
      resetTest();
      break;
    case 'zen mode':
      currentMode = 'zen';
      zenMode = true;
      statsPanel.hide();
      updateModeButtons();
      resetTest();
      break;
    default:
      // Show available commands
      break;
  }
  
  commandPalette.hide();
  screen.render();
});

commandPalette.on('cancel', () => {
  commandPalette.hide();
  screen.render();
});

// Initialize
function resetTest() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  userInput = '';
  startTime = null;
  errors = 0;
  testCompleted = false;
  timeRemaining = timeLimit;
  targetText = generateText(currentMode, wordLimit, punctuation, numbers, customText);
  timerDisplay.setContent(currentMode === 'time' ? `${timeLimit}` : `0`);
  // Reset stats
  wpmStat.setContent('wpm\n0');
  cpmStat.setContent('cpm\n0');
  accuracyStat.setContent('acc\n100%');
  errorStat.setContent('errors\n0');
  resultsModal.hide();
  updateUI();
}


// Start the application
init();