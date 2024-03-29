import { LoggerOptions } from "./types";

export const logger = ({ file, isLogging = false }: LoggerOptions) => ({
  debug: (msg: string, ...args: unknown[]) => {
    if (!isLogging) return;
    if (args) console.debug(`jspm:[${file}]: ${msg}`, ...args);
    else console.debug(`jspm:[${file}]: ${msg}`);
  },
  error: (msg: string, ...args: unknown[]) => {
    if (args) console.error(`jspm:[${file}]: ${msg}`, ...args);
    else console.error(`jspm:[${file}]: ${msg}`);
  },
});
