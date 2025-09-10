import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { logger } from "./logger.js";
import { isDebuggingEnabled as isLogging } from "./config.js";

const log = logger({ file: "cache-path", isLogging });

// Helper function to ensure a file exists
function ensureFileSyncLocal(path: string): void {
  try {
    const dirPath = dirname(path);
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
    writeFileSync(path, "", { flag: "wx" });
  } catch (err) {
    log.error(`ensureFileSyncLocal: Failed in creating ${path}`);
  }
}

/**
 * parseNodeModuleCachePath
 * @description a convenience function to parse modules
 * @param {string} modulePath
 * @param {string} cachePath
 * @returns {string}
 */
export const parseNodeModuleCachePath = async (modulePath: string, cachePath: string): Promise<string> => {
  log.debug("parseNodeModuleCachePath", cachePath, modulePath);
  if (existsSync(cachePath)) return cachePath;
  try {
    const resp = await fetch(modulePath);
    if (!resp.ok) throw Error(`404: Module not found: ${modulePath}`);
    const code = await resp.text();
    ensureFileSyncLocal(cachePath);
    writeFileSync(cachePath, code);
    return cachePath;
  } catch (err) {
    log.error(`parseNodeModuleCachePath: Failed in parsing module ${err}`);
    return cachePath;
  }
}; 