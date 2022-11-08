import path from "path";
import winston, { format } from "winston";
import * as os from "os";

export const createLogger = (name: string, file = "logs") => {
  return winston.createLogger({
    level: "info",
    format: format.json(),
    defaultMeta: { service: name },
    transports: [
      new winston.transports.File({
        filename: path.join(os.tmpdir(), `${file}.log`),
        options: { flags: "w" },
      }),
    ],
  });
};

export type ILogger = winston.Logger;

export default createLogger("default");
