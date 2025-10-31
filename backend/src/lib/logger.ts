import winston from 'winston';
import path from 'path';

// Create logs directory (will be created if doesn't exist)
const logsDir = path.join(process.cwd(), 'logs');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'backend' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'backend-error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // All logs
    new winston.transports.File({
      filename: path.join(logsDir, 'backend-combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
    // Console (for development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service }) => {
          return `${timestamp} [${level}] [${service}]: ${message}`;
        })
      ),
    }),
  ],
});

export default logger;
