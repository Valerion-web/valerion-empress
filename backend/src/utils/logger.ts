import fs from 'fs';
import path from 'path';

const logDir = path.resolve('./logs');
fs.mkdirSync(logDir, { recursive: true });

const formatMessage = (level: string, message: string) =>
  `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;

export const logger = {
  info: (message: string) => {
    const line = formatMessage('info', message);
    console.log(line);
    fs.appendFileSync(path.join(logDir, 'app.log'), `${line}\n`);
  },
  warn: (message: string) => {
    const line = formatMessage('warn', message);
    console.warn(line);
    fs.appendFileSync(path.join(logDir, 'app.log'), `${line}\n`);
  },
  error: (message: string) => {
    const line = formatMessage('error', message);
    console.error(line);
    fs.appendFileSync(path.join(logDir, 'app.log'), `${line}\n`);
  },
};
