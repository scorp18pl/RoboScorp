const winston = require('winston');

class Logger {
  Level;
  Label;
  static static;

  #transports;
  #logger;

  constructor() {
    this.Level = {
      Crit: 'crit',
      Error: 'error',
      Warn: 'warn',
      Info: 'info',
      Debug: 'debug',
    };

    this.Label = {
      General: 'General',
    };

    this.#transports = {
      console: new winston.transports.Console({ level: 'warn' }),
      logFile: new winston.transports.File({
        filename: 'roboscorp.log',
        level: 'info',
      }),
      debugLogFile: new winston.transports.File({
        filename: 'roboscorp.debug.log',
        level: 'debug',
      }),
    };

    this.#logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, label, message }) => {
          return `${timestamp} [${label}] ${level}: ${message}`;
        }),
      ),
      transports: [this.#transports.console, this.#transports.logFile, this.#transports.debugLogFile],
    });

    this.setIsDebug(false);
  }

  log(level, label, message) {
    if (!Object.entries(this.Level).some(([_, val]) => level == val)) {
      this.log(
        this.Level.Error,
        this.Label.General,
        `Provided log level "${level}" does not exist in \
        log call with label "${label}" message "${message}"`,
      );
      return;
    }

    this.#logger.log({ level: level, label: label, message: message });
  }

  crit(message, label = this.Label.General) {
    this.log(this.Level.Crit, label, message);
  }

  error(message, label = this.Label.General) {
    this.log(this.Level.Error, label, message);
  }

  warn(message, label = this.Label.General) {
    this.log(this.Level.Warn, label, message);
  }

  info(message, label = this.Label.General) {
    this.log(this.Level.Info, label, message);
  }

  debug(message, label = this.Label.General) {
    this.log(this.Level.Debug, label, message);
  }

  setIsDebug(isDebug) {
    this.#transports.console.level = isDebug ? this.Level.Debug : this.Level.Warn;
  }
}

const logger = new Logger();

module.exports = logger;
