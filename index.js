#!/usr/bin/env node

const blessed = require('blessed');
const chalk = require('chalk');
const parseCLI = require('./cli');
const { loadConfig } = require('./config');
const { initDB } = require('./database');
const { generateText } = require('./logic/text-generation');
const { calculateStats } = require('./logic/stats');
const { handleInput } = require('./logic/typing');
const fs = require('fs');

// Force enable colors for cmd.exe compatibility
if (process.platform === 'win32') {
  chalk.level = 1;
} else if (!chalk.supportsColor) {
  chalk.level = 0;
}

const cli = parseCLI();
const config = loadConfig();
const db = initDB();

// Theme Definitions
const themes = {
  tokyo: {
    bg: '#1a1b26', fg: '#c0caf5', primary: '#7aa2f7', secondary: '#bb9af7',
    accent: '#ff9e64', correct: '#9ece6a', incorrect: '#f7768e',
    cursor: '#c0caf5', cursorBg: '#414868', subtext: '#565f89',
    statusBg: '#7aa2f7', statusFg: '#1a1b26'
  },
  dracula: {
    bg: '#282a36', fg: '#f8f8f2', primary: '#bd93f9', secondary: '#ff79c6',
    accent: '#ffb86c', correct: '#50fa7b', incorrect: '#ff5555',
    cursor: '#f8f8f2', cursorBg: '#44475a', subtext: '#6272a4',
    statusBg: '#bd93f9', statusFg: '#282a36'
  },
  gruvbox: {
    bg: '#282828', fg: '#ebdbb2', primary: '#fabd2f', secondary: '#d3869b',
    accent: '#fe8019', correct: '#b8bb26', incorrect: '#fb4934',
    cursor: '#ebdbb2', cursorBg: '#504945', subtext: '#928374',
    statusBg: '#fabd2f', statusFg: '#282828'
  },
  monokai: {
    bg: '#272822', fg: '#f8f8f2', primary: '#a6e22e', secondary: '#ae81ff',
    accent: '#fd971f', correct: '#a6e22e', incorrect: '#f92672',
    cursor: '#f8f8f2', cursorBg: '#49483e', subtext: '#75715e',
    statusBg: '#a6e22e', statusFg: '#272822'
  }
};

let currentTheme = themes.tokyo; // Default
let theme = currentTheme; // Alias

// Screen Setup
const screen = blessed.screen({
  smartCSR: true,
  title: 'TypeMaster Pro',
  fullUnicode: true,
  style: {
    bg: theme.bg,
    fg: theme.fg
  }
});

// State Variables
let currentMode = cli.cliMode || config.defaultMode || 'time';
let timeLimit = cli.cliSeconds || 30;
let wordLimit = cli.cliCount || 50;
let punctuation = cli.cliPunctuation || false;
let numbers = cli.cliNumbers || false;
let zenMode = cli.cliZen || false;
let suddenDeath = cli.cliSuddenDeath || false;
let customText = '';
let startTime = null;
let userInput = '';
let errors = 0;
let targetText = '';
let testCompleted = false;
let timeRemaining = timeLimit;
let timerInterval = null;
let wpmHistory = [];

if (cli.cliLoad) {
  try {
    customText = fs.readFileSync(cli.cliLoad, 'utf8');
    currentMode = 'custom';
  } catch (e) {
    console.error('Error loading file:', e.message);
    process.exit(1);
  }
}

// Apply CLI Theme
if (cli.cliTheme && themes[cli.cliTheme]) {
  currentTheme = themes[cli.cliTheme];
  theme = currentTheme;
}

// UI Components

const mainContainer = blessed.box({
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  style: {
    bg: theme.bg
  }
});

const title = blessed.text({
  parent: mainContainer,
  top: 1,
  left: 2,
  content: 'TYPE MASTER',
  style: {
    fg: theme.subtext,
    bg: theme.bg,
    bold: true
  }
});

const timerDisplay = blessed.text({
  parent: mainContainer,
  top: 2,
  left: 'center',
  width: 'shrink',
  height: 1,
  content: timeLimit.toString(),
  style: {
    fg: theme.primary,
    bg: theme.bg,
    bold: true
  }
});

const typingArea = blessed.box({
  parent: mainContainer,
  top: 'center',
  left: 'center',
  width: '80%',
  height: '50%',
  style: {
    bg: theme.bg,
    fg: theme.fg
  },
  align: 'center',
  valign: 'middle',
  wrap: true,
  tags: true
});

const statusLine = blessed.box({
  parent: mainContainer,
  bottom: 0,
  left: 0,
  width: '100%',
  height: 1,
  style: {
    bg: theme.statusBg,
    fg: theme.statusFg
  },
  tags: true
});

const commandPalette = blessed.textbox({
  parent: screen,
  top: 'center',
  left: 'center',
  width: '50%',
  height: 3,
  style: {
    bg: theme.bg,
    fg: theme.fg,
    border: {
      fg: theme.primary
    }
  },
  border: {
    type: 'line'
  },
  label: ' Command Palette ',
  hidden: true,
  inputOnFocus: true
});

const resultsModal = blessed.box({
  parent: screen,
  top: 'center',
  left: 'center',
  width: 70,
  height: 25,
  style: {
    bg: theme.bg,
    fg: theme.fg,
    border: {
      fg: theme.correct
    }
  },
  border: {
    type: 'line'
  },
  label: ' Results ',
  hidden: true,
  tags: true,
  align: 'center',
  valign: 'middle',
  scrollable: true,
  alwaysScroll: true,
  scrollbar: {
    ch: ' ',
    bg: theme.subtext
  }
});

screen.append(mainContainer);

// Logic Functions

function applyTheme(newThemeName) {
  if (themes[newThemeName]) {
    currentTheme = themes[newThemeName];
    theme = currentTheme;

    screen.style.bg = theme.bg;
    screen.style.fg = theme.fg;

    mainContainer.style.bg = theme.bg;

    title.style.fg = theme.subtext;
    title.style.bg = theme.bg;

    timerDisplay.style.fg = theme.primary;
    timerDisplay.style.bg = theme.bg;

    typingArea.style.bg = theme.bg;
    typingArea.style.fg = theme.fg;

    statusLine.style.bg = theme.statusBg;
    statusLine.style.fg = theme.statusFg;

    commandPalette.style.bg = theme.bg;
    commandPalette.style.fg = theme.fg;
    commandPalette.style.border.fg = theme.primary;

    resultsModal.style.bg = theme.bg;
    resultsModal.style.fg = theme.fg;
    resultsModal.style.border.fg = theme.correct;

    screen.render();
  }
}

function getTestInfoText() {
  let info = `${currentMode}`;
  if (currentMode === 'time') info += ` ${timeLimit}s`;
  if (currentMode === 'words') info += ` ${wordLimit}`;
  if (punctuation) info += ' +punc';
  if (numbers) info += ' +num';
  if (suddenDeath) info += ' {red-fg}DEATH{/red-fg}';
  return info;
}

function updateStatusLine(stats = null) {
  const modeStr = ` ${currentMode.toUpperCase()} `;
  const timeStr = ` ${timeRemaining}s `;

  let statsStr = '';
  if (stats) {
    statsStr = ` WPM: ${stats.wpm.toFixed(0)} | ACC: ${stats.accuracy.toFixed(0)}% | ERR: ${stats.errors} `;
  } else {
    statsStr = ` WPM: 0 | ACC: 100% | ERR: 0 `;
  }

  const infoStr = ` ${getTestInfoText()} `;
  const helpStr = ` TAB: Restart | ESC: Quit | C-s-p: Cmds `;

  const left = `{bold}${modeStr}{/bold}|${timeStr}|${statsStr}`;
  const right = `${infoStr}|${helpStr}`;

  const totalLen = screen.cols;
  const contentLen = (modeStr + timeStr + statsStr + infoStr + helpStr).length + 10;
  const padding = ' '.repeat(Math.max(0, totalLen - contentLen));

  statusLine.setContent(`${left}${padding}${right}`);
}

function updateTypingDisplay() {
  if (!targetText) {
    typingArea.setContent('{center}No text available.{/center}');
    return;
  }

  let displayText = '';
  const words = targetText.split(' ');
  let charIndex = 0;

  const displayLimit = Math.min(words.length, 60);

  for (let wordIndex = 0; wordIndex < displayLimit; wordIndex++) {
    const word = words[wordIndex];
    let wordDisplay = '';

    for (let i = 0; i < word.length; i++) {
      const char = word[i];

      if (charIndex < userInput.length) {
        if (userInput[charIndex] === char) {
          wordDisplay += chalk.hex(theme.correct)(char);
        } else {
          wordDisplay += chalk.hex(theme.incorrect)(char);
        }
      } else if (charIndex === userInput.length) {
        wordDisplay += chalk.bgHex(theme.cursor).hex(theme.bg)(char);
      } else {
        wordDisplay += chalk.hex(theme.subtext)(char);
      }
      charIndex++;
    }

    displayText += wordDisplay;

    if (wordIndex < words.length - 1) {
      if (charIndex < userInput.length) {
        if (userInput[charIndex] === ' ') {
          displayText += chalk.hex(theme.correct)(' ');
        } else {
          displayText += chalk.bgHex(theme.incorrect)(' ');
        }
      } else if (charIndex === userInput.length) {
        displayText += chalk.bgHex(theme.cursor).hex(theme.bg)(' ');
      } else {
        displayText += ' ';
      }
      charIndex++;
    }

    if (wordIndex > 0 && wordIndex % 12 === 0) {
      displayText += '\n';
    }
  }

  typingArea.setContent(displayText);
}

function updateUI() {
  updateTypingDisplay();
  if (startTime && !testCompleted) {
    const stats = calculateStats(userInput, startTime, errors);
    updateStatusLine(stats);
  } else {
    updateStatusLine();
  }
  screen.render();
}

function startTimer() {
  if (currentMode === 'time' && !timerInterval) {
    timeRemaining = timeLimit;
    timerInterval = setInterval(() => {
      timeRemaining--;
      timerDisplay.setContent(`${timeRemaining}`);
      const currentStats = calculateStats(userInput, startTime, errors);
      wpmHistory.push(currentStats.wpm);
      updateStatusLine(currentStats);
      screen.render();

      if (timeRemaining <= 0) {
        endTest();
      }
    }, 1000);
  }
}

function endTest() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  testCompleted = true;
  const stats = calculateStats(userInput, startTime, errors);

  if (db && config.saveHistory) {
    try {
      const stmt = db.prepare('INSERT INTO tests (timestamp, mode, wpm, cpm, accuracy, duration, errors) VALUES (?, ?, ?, ?, ?, ?, ?)');
      stmt.run(new Date().toISOString(), currentMode, stats.wpm, stats.cpm, stats.accuracy, stats.duration, stats.errors);
    } catch (e) {
      // Ignore
    }
  }

  showResults(stats);
}

function generateChart(data, height = 8, width = 55) {
  if (!data || data.length < 2) return '{center}{yellow-fg}Not enough data for chart{/yellow-fg}{/center}';

  // Downsample if too much data
  let displayData = data;
  if (data.length > width) {
    const step = data.length / width;
    displayData = [];
    for (let i = 0; i < width; i++) {
      const start = Math.floor(i * step);
      const end = Math.floor((i + 1) * step);
      const chunk = data.slice(start, end);
      const avg = chunk.reduce((a, b) => a + b, 0) / (chunk.length || 1);
      displayData.push(avg);
    }
  }

  const max = Math.max(...displayData);
  const min = Math.min(...displayData);
  const range = max - min || 1;

  const blocks = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const chartRows = [];

  for (let h = height - 1; h >= 0; h--) {
    let row = '';
    // Y-Axis Label
    if (h === height - 1) row += `${max.toFixed(0).padStart(3)} ┤`;
    else if (h === 0) row += `${min.toFixed(0).padStart(3)} ┤`;
    else row += '    │';

    for (let i = 0; i < displayData.length; i++) {
      const val = displayData[i];
      const normalized = (val - min) / range;
      const scaledVal = normalized * height;
      const rowVal = scaledVal - h;

      if (rowVal >= 1) {
        row += '█';
      } else if (rowVal > 0) {
        const blockIndex = Math.floor(rowVal * (blocks.length - 1));
        row += blocks[blockIndex];
      } else {
        row += ' ';
      }
    }
    chartRows.push(row);
  }

  chartRows.push('    └' + '─'.repeat(displayData.length));

  return '{cyan-fg}' + chartRows.join('\n') + '{/cyan-fg}';
}

function showResults(stats) {
  const chart = generateChart(wpmHistory);

  const content = `
{center}{bold}Test Completed!{/bold}{/center}

{center}
WPM:      {bold}{green-fg}${stats.wpm.toFixed(1)}{/green-fg}{/bold}
CPM:      ${stats.cpm.toFixed(1)}
Accuracy: ${stats.accuracy.toFixed(1)}%
Errors:   ${stats.errors}
Time:     ${stats.duration.toFixed(1)}s
{/center}

${chart}

{center}Press {bold}Enter{/bold} or {bold}Tab{/bold} to restart{/center}
`;

  resultsModal.setContent(content);
  resultsModal.show();
  resultsModal.focus();
  screen.render();
}

function resetTest() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  userInput = '';
  startTime = null;
  errors = 0;
  wpmHistory = [];
  testCompleted = false;
  timeRemaining = timeLimit;
  targetText = generateText(currentMode, wordLimit, punctuation, numbers, customText);

  timerDisplay.setContent(currentMode === 'time' ? `${timeLimit}` : `0`);
  resultsModal.hide();
  updateUI();
}

// Event Handlers

screen.key(['C-c'], () => {
  if (db) db.close();
  process.exit(0);
});

screen.key(['tab', 'enter'], () => {
  if (resultsModal.visible) {
    resultsModal.hide();
  }
  resetTest();
});

screen.key(['escape'], () => {
  if (resultsModal.visible) {
    resultsModal.hide();
    resetTest();
  } else if (commandPalette.visible) {
    commandPalette.hide();
    screen.render();
  } else {
    if (db) db.close();
    process.exit(0);
  }
});

screen.key(['C-S-p'], () => {
  if (!commandPalette.visible) {
    commandPalette.setValue('');
    commandPalette.show();
    commandPalette.focus();
    screen.render();
  }
});

commandPalette.on('submit', (value) => {
  const cmd = value.toLowerCase().trim();

  if (cmd.includes('time')) {
    currentMode = 'time';
    const args = cmd.split(' ');
    if (args[1] && !isNaN(args[1])) timeLimit = parseInt(args[1]);
  } else if (cmd.includes('words')) {
    currentMode = 'words';
    const args = cmd.split(' ');
    if (args[1] && !isNaN(args[1])) wordLimit = parseInt(args[1]);
  } else if (cmd.includes('quote')) {
    currentMode = 'quote';
  } else if (cmd.includes('zen')) {
    currentMode = 'zen';
    zenMode = true;
  } else if (cmd === 'punc' || cmd === 'punctuation') {
    punctuation = !punctuation;
  } else if (cmd === 'num' || cmd === 'numbers') {
    numbers = !numbers;
  } else if (cmd === 'quit' || cmd === 'exit') {
    process.exit(0);
  } else if (cmd === 'sudden death' || cmd === 'death') {
    suddenDeath = !suddenDeath;
  } else if (cmd.startsWith('theme ')) {
    const themeName = cmd.split(' ')[1];
    applyTheme(themeName);
  } else if (themes[cmd]) {
    applyTheme(cmd);
  }

  commandPalette.hide();
  resetTest();
});

commandPalette.key(['escape'], () => {
  commandPalette.hide();
  screen.render();
});

screen.on('keypress', (ch, key) => {
  if (commandPalette.visible || resultsModal.visible) return;
  if (!targetText || testCompleted) return;

  if (key.name === 'tab' || key.name === 'escape' || (key.ctrl && key.shift && key.name === 'p')) return;

  if (!startTime) {
    startTime = Date.now();
    if (currentMode === 'time') startTimer();
  }

  const result = handleInput({ ch, key, userInput, targetText, errors, config });

  // Sudden Death Check
  if (suddenDeath && result.newErrors > errors) {
    userInput = result.newInput;
    errors = result.newErrors;
    updateUI();

    // Fail immediately
    testCompleted = true;
    if (timerInterval) clearInterval(timerInterval);

    const content = `
{center}{red-fg}{bold}SUDDEN DEATH!{/bold}{/red-fg}{/center}

{center}You made a mistake.{/center}

{center}Press {bold}Enter{/bold} to restart{/center}
`;
    resultsModal.setContent(content);
    resultsModal.show();
    resultsModal.focus();
    screen.render();
    return;
  }

  userInput = result.newInput;
  errors = result.newErrors;

  if (userInput.length === targetText.length || (currentMode === 'words' && userInput.split(' ').length >= wordLimit)) {
    endTest();
    return;
  }

  // Infinite Scroll (Zen & Time)
  if ((currentMode === 'zen' || currentMode === 'time') && userInput.length > targetText.length - 50) {
    const newText = generateText(currentMode, 20, punctuation, numbers);
    targetText += ' ' + newText;
  }

  updateUI();
});

resetTest();