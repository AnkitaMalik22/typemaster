# TypeMaster Pro

**v2.0.0 - Neovim Edition** 🚀

A beautiful, Neovim-inspired terminal typing test with multiple themes, challenge modes, and real-time analytics. Built for speed demons and typing perfectionists.

## ✨ Features

### 🎨 **Multiple Themes**
- **Tokyo Night** (default) - Cool blues and purples
- **Dracula** - Classic dark theme
- **Gruvbox** - Retro warmth
- **Monokai** - Vibrant colors

### 🎮 **Game Modes**
- **Time Mode** - Race against the clock (15s, 30s, 60s, etc.)
- **Words Mode** - Complete a set number of words
- **Quote Mode** - Type inspiring quotes
- **Zen Mode** - Infinite, distraction-free typing
- **Custom Mode** - Load your own text files

### ⚡ **Challenge Features**
- **Sudden Death** - One mistake = game over 💀
- **Punctuation & Numbers** - Toggle on/off for extra difficulty
- **Real-time WPM/Accuracy** - Live stats in a sleek status bar
- **Command Palette** - Vim-style command interface (`Ctrl+Shift+P`)

### 📊 **Analytics**
- WPM/CPM/Accuracy tracking
- Error counting
- Test history with SQLite persistence
- Export results to JSON/CSV

## 📦 Installation

```bash
npm install -g typemaster-pro
```

## 🚀 Quick Start

```bash
# Start with default settings (Tokyo Night theme, 30s timer)
typemaster

# Or just
npm start
```

## 🎯 Usage Examples

### Basic Commands
```bash
# 60-second test with Dracula theme
typemaster --mode time --seconds 60 --theme dracula

# 100-word test with punctuation
typemaster --mode words --count 100 --punctuation

# Sudden Death mode with Gruvbox theme
typemaster --sudden-death --theme gruvbox

# Zen mode with numbers
typemaster --zen --numbers

# Load custom text
typemaster --load my_story.txt
```

### Command Palette (In-App)
Press `Ctrl+Shift+P` to open the command palette, then type:

```
time 60          - Switch to 60-second timed mode
words 100        - Switch to 100-word mode
quote            - Switch to quote mode
zen              - Switch to zen mode
punc             - Toggle punctuation
num              - Toggle numbers
sudden death     - Toggle sudden death mode
theme dracula    - Switch to Dracula theme
tokyo            - Switch to Tokyo Night
gruvbox          - Switch to Gruvbox
monokai          - Switch to Monokai
quit             - Exit the app
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` or `Enter` | Restart test |
| `Esc` | Quit (or close palette/results) |
| `Ctrl+Shift+P` | Open command palette |
| `Ctrl+C` | Force exit |

## ⚙️ Configuration

Create or edit `~/.typemaster/config.toml`:

```toml
defaultMode = "time"          # time, words, quote, zen
allowCorrections = true       # Allow backspace corrections
saveHistory = true            # Save test results to database
```

## 🎨 Themes Preview

All themes feature:
- **Block cursor** for retro terminal feel
- **Color-coded feedback** (green = correct, red = error)
- **Ghost text** for untyped characters
- **Status bar** with real-time stats

## 🏆 Sudden Death Mode

For the perfectionists:
```bash
typemaster --sudden-death
```

One typo and it's **GAME OVER**. The ultimate typing challenge!

## 📈 What's New in v2.0.0

- ✅ 4 beautiful themes (Tokyo Night, Dracula, Gruvbox, Monokai)
- ✅ Sudden Death challenge mode
- ✅ Infinite Zen mode with auto-generating text
- ✅ Improved character input (no more freezing!)
- ✅ Enhanced CLI with `--theme` and `--sudden-death` flags
- ✅ 200+ word dictionary for better variety
- ✅ Neovim-inspired minimalist UI
- ✅ Powerline-style status bar

## 🧪 Testing

```bash
npm test
```

## 🤝 Contributing

Found a bug? Want a feature? Open an issue or PR!

## 📄 License

MIT © Ankita Malik

---

**Happy Typing!** ⌨️✨
