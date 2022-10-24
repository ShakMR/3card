import path from "path";
import winston, { format } from "winston";


export const createLogger = (name: string) => {
    return winston.createLogger({
        level: 'info',
        format: format.json(),
        defaultMeta: { service: name },
        transports: [
            new winston.transports.File({ filename: path.join(__dirname, '..', '..', 'logs', `logs.log`), options: { flags: 'w' } }),
        ],
    });
};

export type ILogger = winston.Logger

export default createLogger("default");
