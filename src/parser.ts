import { existsSync, writeFileSync } from "node:fs";
import { ensureFileSync, getLastPart, getVersion } from "src/utils";
import { logger } from "src/logger";
import { isDebuggingEnabled } from "./config";

/**
 * ******************************************************
 * PARSER 🔪
 * ------------------------------------------------------
 * @description handles parsing directories for cached paths
 *
 * ******************************************************
 */

const log = logger({ file: "parser", isLogging: isDebuggingEnabled() });

export const getPackageNameVersionFromUrl = (url: string) => {
  try {
    const file = getLastPart(url, "/");
    const urlParts = url?.split("@");
    const urlPartsCount = urlParts.length;
    if (urlPartsCount === 3) {
      const name = `@${urlParts[1]}`;
      const version = getVersion(urlParts)(2);
      return { file, name, version };
    }
    const name = getLastPart(getLastPart(urlParts[0], "/"), ":");
    const version = getVersion(urlParts)(1);
    return { file, name, version };
  } catch (err) {
    log.error(`getPackageNameVersionFromUrl: ${err}`, {});
    return {};
  }
};

export const parseNodeModuleCachePath = async (modulePath: string, cachePath: string) => {
  log.debug("parseNodeModuleCachePath", cachePath, modulePath);
  if (existsSync(cachePath)) return cachePath;
  try {
    const resp = await fetch(modulePath);
    if (!resp.ok) throw Error(`404: Module not found: ${modulePath}`);
    const code = await resp.text();
    ensureFileSync(cachePath);
    writeFileSync(cachePath, code);
    return cachePath;
  } catch (err) {
    log.error(`parseNodeModuleCachePath: Failed in parsing module ${err}`);
    return cachePath;
  }
};
