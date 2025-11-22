// Typing logic, input handling
function handleInput({ ch, key, userInput, targetText, errors, config }) {
  let newInput = userInput;
  let newErrors = errors;

  if (key.name === 'backspace') {
    if (newInput.length > 0) {
      const lastChar = newInput[newInput.length - 1];
      const targetChar = targetText[newInput.length - 1];
      if (config.allowCorrections && lastChar !== targetChar) {
        newErrors = Math.max(0, newErrors - 1);
      }
      newInput = newInput.slice(0, -1);
    }
  } else if (ch && ch.length === 1 && ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) <= 126) {
    // Accept any printable ASCII character (space to tilde ~)
    newInput += ch;
    if (newInput[newInput.length - 1] !== targetText[newInput.length - 1]) {
      newErrors++;
    }
  }

  return { newInput, newErrors };
}

module.exports = { handleInput };
