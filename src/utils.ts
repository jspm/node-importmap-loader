import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { ImportMap } from "@jspm/import-map";

/**
 * ******************************************************
 * UTILS
 * ------------------------------------------------------
 * @description a collection of utility functions
 * @summary a collection of utility functions
 * which aren't reliant on each other (for easy testability)
 *
 * ******************************************************
 */


/**
 * ensureDirSync
 * @description a function to ensure the dis exists
 * @param dirPath
*/
export const ensureDirSync = (dirPath: string) => {
  if (existsSync(dirPath)) return;
  const parentDir = dirname(dirPath);
  if (parentDir !== dirPath) ensureDirSync(parentDir);
  mkdirSync(dirPath);
}

/**
 * constructImportMap
 * @description a convenience function to construct an import map
 * @param {string} path
 * @param {string} rootUrl
 * @returns {ImportMap|null}
 */
export const constructImportMap = (path = "", rootUrl = import.meta.url) => {
  const pathExists = existsSync(path);
  const json = readFileSync(path, { encoding: "utf8" });
  const map = pathExists && json ? JSON.parse(json) : {};
  return new ImportMap({
    rootUrl,
    map,
  });
};
