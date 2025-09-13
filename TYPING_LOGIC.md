# Typing Logic in TypeMaster Pro

This document explains how the typing logic works in the TypeMaster Pro terminal application.

## Overview
TypeMaster Pro provides a real-time typing test experience in the terminal. The typing logic is responsible for:
- Displaying the target text
- Tracking user input
- Highlighting correct and incorrect characters
- Calculating statistics (WPM, CPM, accuracy, errors)
- Handling test completion and user interactions

## Typing Flow
1. **Text Generation**
   - The app generates the target text based on the selected mode (time, words, quote, zen, or custom).
   - For time/words mode, it randomly selects words and adds punctuation/numbers if enabled.
   - For quote mode, it picks a random quote.
   - For custom mode, it loads text from a file.

2. **User Input Tracking**
   - The app listens for keypress events.
   - On each keypress, it updates the `userInput` string.
   - Backspace removes the last character, optionally reducing the error count if corrections are allowed.
   - Only valid characters (letters, numbers, punctuation, space) are accepted.

3. **Visual Feedback**
   - The typing area displays the target text with color-coded feedback:
     - **Green**: Correctly typed characters
     - **Red**: Incorrectly typed characters
     - **White highlight**: Current character to type
     - **Cyan**: Remaining (untyped) characters
   - Spaces are also color-coded for accuracy.

4. **Error Counting**
   - Each incorrect character increases the error count.
   - If corrections are allowed, fixing errors with backspace reduces the error count.

5. **Statistics Calculation**
   - WPM (Words Per Minute): Based on the number of characters typed, divided by 5, and the elapsed time.
   - CPM (Characters Per Minute): Total characters typed divided by elapsed time.
   - Accuracy: Percentage of correct characters out of total typed.
   - Errors: Total incorrect characters.

6. **Test Completion**
   - The test ends when:
     - Time runs out (time mode)
     - All words are typed (words mode)
     - All text is typed (quote/custom mode)
   - Final stats are calculated and displayed in a results modal.
   - Results are saved to the database if enabled.

7. **Restart & Mode Switching**
   - Users can restart the test or switch modes using keybindings or the command palette.
   - The typing area and stats are reset for each new test.

## Example
When you start typing, each character is compared to the target text:
- If correct, it turns green.
- If incorrect, it turns red and increases the error count.
- The next character to type is highlighted.
- Stats update in real time as you type.

## References
See `index.js` for the implementation details, especially the `updateTypingDisplay`, `calculateStats`, and key event handlers.
