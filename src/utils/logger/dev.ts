import { createLogger, format, transports } from "winston";

const devLogger = () => {
  const myFormat = format.printf(
    ({ level, message, timestamp, stack, statusCode, codePhrase }) => {
      if (level === "\x1b[31merror\x1b[39m") {
        if (message && typeof message === "object") {
          return `${timestamp} ${level}: ${JSON.stringify(
            message,
            null,
            2
          )}\n Status: ${statusCode} - ${codePhrase}\n Stack: ${stack}`;
        }
        return `${timestamp} ${level}: ${message}\n Status: ${statusCode} - ${codePhrase}\n Stack: ${stack}`;
      } else {
        if (message && typeof message === "object") {
          return `${timestamp} ${level}: ${JSON.stringify(message, null, 2)}`;
        }
        return `${timestamp} ${level}: ${message}`;
      }
    }
  );

  return createLogger({
    level: "debug",
    // format: winston.format.simple(),
    format: format.combine(
      format.colorize(),
      format.label({ label: "right meow!" }),
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      myFormat
    ),

    defaultMeta: { service: "user-service" },
    // transports: [new transports.Console()],
    transports: [
      new transports.Console(),
      new transports.File({
        filename: "prod.errors.log",
      }),
    ],
  });
};

export default devLogger;
