/**
 * @file Minimal file-logger used by ingestion and maintenance scripts.
 * Writes timestamped entries to `scripts/logs/<script>.log`.
 * Designed for non-interactive Node scripts so CI / automation can collect logs.
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

const logDir = path.resolve(process.cwd(), 'scripts', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const scriptName = path.basename(process.argv[1] || 'scripts', '.js');
const logPath = path.join(logDir, `${scriptName}.log`);

function write(level, msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level}] ${msg}\n`;
  try {
    fs.appendFileSync(logPath, line, 'utf8');
  } catch (e) {
    // best-effort: fallback to stderr if file write fails
    process.stderr.write(line);
  }
}

module.exports = {
  info: (...args) => write('INFO', util.format.apply(null, args)),
  warn: (...args) => write('WARN', util.format.apply(null, args)),
  error: (...args) => write('ERROR', util.format.apply(null, args)),
  path: logPath,
};
