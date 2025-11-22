// CLI argument parsing and entry point
const args = process.argv.slice(2);

module.exports = function parseCLI() {
  let cliMode = null;
  let cliSeconds = 30;
  let cliCount = 50;
  let cliPunctuation = false;
  let cliNumbers = false;
  let cliZen = false;
  let cliSuddenDeath = false;
  let cliTheme = null;
  let cliLoad = null;
  let cliExport = null;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--mode':
        cliMode = args[++i];
        break;
      case '--seconds':
        cliSeconds = parseInt(args[++i]);
        break;
      case '--count':
        cliCount = parseInt(args[++i]);
        break;
      case '--punctuation':
        cliPunctuation = true;
        break;
      case '--numbers':
        cliNumbers = true;
        break;
      case '--zen':
        cliZen = true;
        break;
      case '--sudden-death':
        cliSuddenDeath = true;
        break;
      case '--theme':
        cliTheme = args[++i];
        break;
      case '--load':
        cliLoad = args[++i];
        break;
      case '--export':
        cliExport = args[++i];
        break;
    }
  }

  return { cliMode, cliSeconds, cliCount, cliPunctuation, cliNumbers, cliZen, cliSuddenDeath, cliTheme, cliLoad, cliExport };
}
