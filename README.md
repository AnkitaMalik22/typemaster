# TypeMaster Pro

A full-featured terminal-based typing test inspired by Monkeytype, with dark theme, multiple modes, real-time stats, and persistence.

## Features
- Dark-themed UI with responsive layout
- Modes: Time, Words, Quote, Zen, Custom
- Real-time WPM/CPM/Accuracy tracking
- Leaderboard and history
- Configurable keybindings
- Export results to JSON/CSV

## Installation
```bash
npm install -g typemaster-pro
```

## Usage
```bash
typemaster
```

### Example Commands
```bash
# Time mode for 30 seconds
typemaster --mode time --seconds 30

# Words mode with 60 words, no punctuation
typemaster --mode words --count 60 --no-punctuation

# Load custom text file
typemaster --load my_text.txt

# Zen mode
typemaster --zen

# Export results
typemaster --export results.csv
```

### Keybindings
- Tab + Enter: Restart test
- Esc: Open command palette
- Ctrl+C: Exit

### Config
Edit `~/.typemaster/config.toml`:
```toml
defaultMode = "time"
allowCorrections = true
saveHistory = true
```

## Testing
```bash
npm test
```

## License
MIT
