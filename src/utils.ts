import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import fetch from "node-fetch";
import { ImportMap } from "@jspm/import-map";
import { CreateCacheMapFactory } from "src/types";
import { ALL_CACHE_MAP_REQUIREMENTS_MUST_BE_DEFINED, NO_CACHE_MAP_DEFINED } from "src/constants";

import { logger } from "./logger";

const log = logger({ file: "utils" });

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

const cwd = process.cwd();

/**
 * constructPath
 * @description a convenience function to construct a path
 * @param {string} dir
 * @param {string} root
 * @returns {string}
 */
export const constructPath = (path: string, root = cwd) => {
  const out = join(root, path);
  return out;
};

/**
 * constructImportMap
 * @description a convenience function to construct an import map
 * @param {string} path
 * @param {string} rootUrl
 * @returns {ImportMap|null}
 */
export const constructImportMap = (path = "", root = cwd) => {
  const pathExists = existsSync(path);
  const json = readFileSync(path, { encoding: "utf8" });
  const map = pathExists && json ? JSON.parse(json) : {};
  const rootUrl = `file://${root}`;
  return new ImportMap({
    rootUrl,
    map,
  });
};

/**
 * createCacheMap
 * @description a factory function for managing a cache map
 * @param {boolean} debug
 * @returns {createCacheMap}
 */
export const createCacheMap = (debug = false): CreateCacheMapFactory => {
  const instance = new Map();
  const isDebugging = debug;
  let cachePath: string | undefined, modulePath: string | undefined;
  return {
    cachePath,
    instance,
    isDebugging,
    modulePath,
    get(cachePath: string) {
      const path = this.instance.get(cachePath) || cachePath;
      if (!path) {
        log.error(NO_CACHE_MAP_DEFINED);
        return;
      }
      return path;
    },
    set(cachePath: string, modulePath: string) {
      const hasRequiredArgs = cachePath && modulePath;
      if (!hasRequiredArgs) {
        log.error(ALL_CACHE_MAP_REQUIREMENTS_MUST_BE_DEFINED);
        return;
      }
      this.instance.set(cachePath, modulePath);
    },
  };
};

/**
 * parseModule
 * @description a convenience function to parse the modules, this function is called by the loader automatically
 * @param {string} modulePath
 * @param {string} cachePath
 * @param {boolean} debug
 * @returns {string}
 */
export const parseNodeModuleCachePath = async (modulePath: string, cachePath: string) => {
  try {
    if (existsSync(cachePath)) return cachePath;
    const resp = await fetch(modulePath);
    if (!resp.ok) throw Error(`404: Module not found: ${modulePath}`);
    const nodeModuleCode = await resp.text();
    const dirPath = dirname(cachePath);
    mkdirSync(dirPath, { recursive: true });
    writeFileSync(cachePath, nodeModuleCode);
    return cachePath;
  } catch (err) {
    log.error(`parseNodeModuleCachePath: Failed in parsing module ${err}`);
    return "";
  }
};
