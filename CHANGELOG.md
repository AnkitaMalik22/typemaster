# Changelog

## [2.2.0] - Analytics & Polish

### Added
- **Post-Game Analytics**: View a beautiful ASCII sparkline chart of your WPM performance after each test.
- **Infinite Zen Mode**: Zen mode now generates text indefinitely as you type, so you never run out of words.

## [2.1.0] - Themes & Sudden Death

### Added
- **Theme Switcher**: Switch between Tokyo Night, Dracula, Gruvbox, and Monokai themes via Command Palette.
- **Sudden Death Mode**: A hardcore mode where the test ends immediately upon the first error. Toggle via Command Palette or `--sudden-death` flag.
- **CLI Flags**: Added `--theme [name]` and `--sudden-death` flags.

## [2.0.3] - Infinite Scroll

### Added
- **Infinite Scroll for Time Mode**: Text now auto-generates as you type in Time Mode, so you never run out of words.

### Fixed
- Restored Neovim UI that was accidentally reverted.

## [2.0.2] - Bug Fixes

### Fixed
- Crash when test ends due to missing arguments in stats calculation.
- Added safety checks for stats calculation.

## [2.0.1] - Documentation

### Added
- **Neovim-inspired UI**: Minimalist interface with a powerline-style status bar.
- **Tokyo Night Theme**: A beautiful dark theme for better focus and aesthetics.
- **Command Palette**: Access commands quickly with `Ctrl+Shift+P` (like VS Code / Neovim).
- **Block Cursor**: A solid block cursor for a retro terminal feel.
- **Expanded Dictionary**: Added 200+ common English words for better variety.
- **New Quotes**: Added more inspirational quotes for Quote Mode.
- **CLI Options**: Added `--numbers` flag.

### Changed
- **Default Mode**: Punctuation is now OFF by default (use `--punctuation` to enable).
- **Layout**: Removed bulky headers and borders in favor of a clean, full-screen experience.
- **Typing Feedback**: Improved visual feedback with "ghost text" for untyped characters.

### Fixed
- CLI argument parsing for numbers.
