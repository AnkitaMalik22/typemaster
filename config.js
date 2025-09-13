// Configuration loading and management
const fs = require('fs');
const path = require('path');
const os = require('os');

const configPath = path.join(os.homedir(), '.typemaster', 'config.toml');

function loadConfig() {
  try {
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
    if (fs.existsSync(configPath)) {
      const toml = require('toml');
      return toml.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    // Ignore config loading errors
  }
  return {
    defaultMode: 'time',
    allowCorrections: true,
    saveHistory: true
  };
}

module.exports = { loadConfig, configPath };
