import { existsSync, writeFileSync } from "node:fs";
import fetch from "node-fetch";
import { ensureDirSync } from "src/utils";
import { logger } from "src/logger";

const log = logger({ file: "utils" });

/**
 * parseNodeModuleCachePath
 * @description a convenience function to parse modules
 * @param {string} modulePath
 * @param {string} cachePath
 * @returns {string}
 */
export const parseNodeModuleCachePath = async (modulePath: string, cachePath: string) => {
  try {
    if (existsSync(cachePath)) return cachePath;
    const resp = await fetch(modulePath);
    if (!resp.ok) throw Error(`404: Module not found: ${modulePath}`);
    const code = await resp.text();
    ensureDirSync(cachePath);
    writeFileSync(cachePath, code);
    return cachePath;
  } catch (err) {
    log.error(`parseNodeModuleCachePath: Failed in parsing module ${err}`);
    return cachePath;
  }
};
