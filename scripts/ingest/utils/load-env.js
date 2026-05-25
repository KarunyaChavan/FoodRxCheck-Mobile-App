/**
 * @file Loads the project `.env` file for Node-based ingestion scripts.
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Load `process.cwd()/.env` if it exists.
 * The `\r?\n` pattern accepts both Windows and Unix line endings.
 */
function loadProjectEnv() {
  const dotenvPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(dotenvPath)) {
    return;
  }

  const raw = fs.readFileSync(dotenvPath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    if (!line || line.trim().startsWith('#')) {
      return;
    }

    const idx = line.indexOf('=');
    if (idx === -1) {
      return;
    }

    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  });
}

module.exports = { loadProjectEnv };