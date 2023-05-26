import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from 'node:util';
import fetch from "node-fetch";
import { ImportMap } from "@jspm/import-map";

import {
  ALL_CACHE_MAP_REQUIREMENTS_MUST_BE_DEFINED,
  NO_CACHE_MAP_DEFINED,
  PROCESS_CLI_ARGS_OPTIONS
} from "./constants";

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

const metaUrl = import.meta.url || '';

/**
 * constructPath
 * @description a convenience function to construct a path
 * @param {string} dir
 * @param {string} root
 * @returns {string}
 */
export const constructPath = (dir: string, root = '.') => join(root, dir)

/**
 * getVersion
 * @description a convenience function to get the version from a node module cdn url
 * @param {string[]} urlParts
 * @param {boolean} debug
 * @returns {string}
 */
export const getVersion = (urlParts: string[], index: number, debug = false) => {
  try {
    return urlParts?.[index]?.split('/')?.[0]
  } catch (err) {
    if (debug) console.error(`getVersion: Failed in getting the version from the url ${err}`)
    return ''
  }
};

/**
 * getLastPart
 * @description a convenience function to get the last part of a string
 * @param {string} part
 * @param {string} char
 * @param {boolean} debug
 * @returns {string}
 */
export const getLastPart = (part: string, char: string, debug = false) => {
  try {
    return part.length && char && part.split(char).reverse()[0] || '';
  } catch (err) {
    if (debug) console.error(`getLastPart: Failed in getting the last part of a string ${err}`)
    return ''
  }
}

/**
 * constructUrlPath
 * @description a convenience function to construct a url path
 * @param {string} base
 * @param {string} url
 * @param {boolean} debug
 * @returns {string}
 */
export const constructUrlPath = (base = '.', url: string = metaUrl, debug = false) => {
  try {
    const path = new URL(base, url)
    return fileURLToPath(path)
  } catch (err) {
    if (debug) console.error(`constructUrlPath: Failed in creating a url path ${err}`)
    return ''
  }
}

/**
 * constructImportMap
 * @description a convenience function to construct an import map
 * @param {string} path
 * @param {string} rootUrl
 * @returns {ImportMap|null}
 */
export const constructImportMap = (path = '', rootUrl = metaUrl) => {
  try {
    const pathExists = existsSync(path)
    const map = pathExists
      ? JSON.parse(readFileSync(path, { encoding: "utf8" }))
      : {}
    return new ImportMap({
      rootUrl,
      map,
    })
  } catch (err) {
    console.error(`constructImportMap: Failed in creating an import map ${err}`)
    return null
  }
}

/**
 * nsureDirSync
 * @description a function to ensure the dis exists
 * @param {string} path
 * @param {boolean} debug
 * @returns {void}
*/

export function ensureDirSync(path: string, debug = false) {
  try {
    const dirPath = dirname(path);
    if (!existsSync(path)) mkdirSync(dirPath, { recursive: true })
  } catch (err) {
    if (debug) console.error(`ensureDirSync: Failed in creating dir ${err}`)
  }
}

/**
 * ensureFileSync
 * @description a convenience function to ensure a file exists
 * @param {string} path
 * @param {boolean} debug
 * @returns {void}
 */

export function ensureFileSync(path: string, debug = false) {
  try {
    writeFileSync(path, '', { flag: 'wx' });
  } catch (err) {
    if (debug) console.error(`ensureFileSync: Failed in creating ${err}`)
  }
}

/**
 * createCacheMap
 * @description a factory function for managing a cache map
 * @param {boolean} debug
 * @returns {createCacheMap}
 */
export const createCacheMap = (debug = false) => {
  const instance = new Map();
  const isDebugging = debug;
  let cachePath: string | undefined, modulePath: string | undefined;
  return {
    cachePath,
    instance,
    isDebugging,
    modulePath,
    get(cachePath: string) {
      this.cachePath = this.instance.get(cachePath) || cachePath;
      if (!this.cachePath && this.isDebugging) console.error(NO_CACHE_MAP_DEFINED);
      return this.cachePath;
    },
    set(cachePath: string, modulePath: string) {
      this.cachePath = cachePath;
      this.modulePath = modulePath;
      const hasRequiredArgs = this.cachePath && this.modulePath;
      if (!hasRequiredArgs && this.isDebugging) return console.error(ALL_CACHE_MAP_REQUIREMENTS_MUST_BE_DEFINED);
      this.instance.set(this.cachePath, this.modulePath);
    }
  }
}



/**
 * parseModule
 * @description a convenience function to parse the modules, this function is called by the loader automatically
 * @param {string} modulePath
 * @param {string} cachePath
 * @param {boolean} debug
 * @returns {string}
 */
export const parseNodeModuleCachePath = async (modulePath: string, cachePath: string, debug = false) => {
  try {
    const nodeModuleCode = await (await fetch(modulePath)).text();
    const dirPath = dirname(cachePath);
    if (!existsSync(cachePath)) mkdirSync(dirPath, { recursive: true })
    writeFileSync(cachePath, nodeModuleCode);
    return cachePath;
  } catch (err) {
    if (debug) console.error(`parseNodeModuleCachePath: Failed in parsing module ${err}`);
    return '';
  }
};

export const processCliArgs = (args: string[], opts = PROCESS_CLI_ARGS_OPTIONS) =>
  parseArgs({ args, options: opts, allowPositionals: true });
