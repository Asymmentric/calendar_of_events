import winston from "winston";
import devLogger from "./dev";
import productionLogger from "./production";
import testLogger from "./test";

class Logger {
  public static levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  };

  public static levelKeys = Object.keys(
    Logger.levels
  ) as (keyof typeof Logger.levels)[];

  public static Log: winston.Logger | Console | null = null;

  constructor() {
    if (process.env.NODE_ENV === "dev") {
      Logger.Log = devLogger();
    }

    if (process.env.NODE_ENV === "production") {
      Logger.Log = productionLogger();
    }

    if (process.env.NODE_ENV === "test") {
      Logger.Log = testLogger();
    }
  }
}

export default Logger;
