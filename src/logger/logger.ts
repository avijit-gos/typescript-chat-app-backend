/** @format */

import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, errors } = format;

// Define the custom log format
const logFormat = printf(({ level, message, timestamp, url, method }) => {
  return JSON.stringify({
    type: level, // The log level (error, info, etc.)
    url: url || "", // Add URL if provided
    method: method || "", // Add method if provided
    message: message,
    timestamp: timestamp,
  });
});

// Create a logger instance
const logger = createLogger({
  level: "info", // Adjust the log level as needed
  format: combine(
    timestamp(), // Add timestamps to logs
    errors({ stack: true }), // Capture stack traces in error logs
    logFormat // Use the custom log format
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: "logs/error.log", level: "error" }), // Log error level to a file
    new transports.File({ filename: "logs/combined.log" }), // Log all levels to a file
  ],
});

export default logger;
