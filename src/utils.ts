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

const cwd = process.cwd();

/**
 * constructPath
 * @description a convenience function to construct a path
 * @param {string} dir
 * @param {string} root
 * @returns {string}
 */
export const constructPath = (dir: string, root = '.') => join(root, dir)

/**
 * constructUrlPath
 * @description a convenience function to construct a url path
 * @param {string} base
 * @param {string} url
 * @param {boolean} debug
 * @returns {string}
 */
export const constructUrlPath = (base = '.', url: string = cwd, debug = false) => {
  try {
    const path = new URL(base, url)
    return fileURLToPath(path.href)
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
export const constructImportMap = (path = '', rootUrl = cwd) => {
  try {
    const pathExists = existsSync(path)
    const map = pathExists
      ? JSON.parse(readFileSync(path, { encoding: "utf8" }))
      : {}
    console.log({ map });
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
    if (existsSync(cachePath)) return cachePath

    const nodeModuleCode = await (await fetch(modulePath).then(response => {
      if (!response.ok) throw Error(`404: Module not found: ${modulePath}`);
      return response;
    })).text();
    const dirPath = dirname(cachePath);
    if (!existsSync(cachePath)) mkdirSync(dirPath, { recursive: true })

    writeFileSync(cachePath, nodeModuleCode);
    return cachePath;
  } catch (err) {
    if (debug) console.error(`parseNodeModuleCachePath: Failed in parsing module ${err}`);
    return '';
  }
};

/**
 * processCliArgs
 * @description a convenience function to process cli args
 * @param {string[]} args
 * @param {object }opts
 * @returns {object}
 */
export const processCliArgs = (args: string[], opts = PROCESS_CLI_ARGS_OPTIONS) =>
  parseArgs({ args, options: opts, allowPositionals: true });