
import { getPackageNameVersionFromUrl } from './lib';
import {
  constructPath,
  constructImportMap,
  constructUrlPath,
  createCacheMap,
  parseNodeModuleCachePath,
  processCliArgs,
} from './utils'
import { Context, NextResolve } from './types'

/**
 * ******************************************************
 * LOADER
 * ------------------------------------------------------
 * @description the resolver for a node command
 * @summary TODO: add summary
 *
 * ******************************************************
 */

const metaUrl = import.meta.url || '';

const { values: { basePath, cachePath, debug: isDebugging = false, importmapPath } } = processCliArgs(process.argv)

const cacheMap = createCacheMap(isDebugging)

/**
 * resolve
 * @description a convenience function to resolve the modules, this function is called by the loader automatically
 * @param {string} specifier
 * @param {object} context
 * @param {callback} nextResolve
 * @returns {string}
 */
export const resolve = async (specifier: string, { parentURL }: Context, nextResolve: NextResolve, debug = isDebugging) => {
  try {
    const root = constructUrlPath(basePath, metaUrl, debug);
    const pathToImportMap = importmapPath || root;
    const nodeImportMapPath = constructPath('node.importmap', pathToImportMap);
    const pathToCache = cachePath || parentURL;
    if (!pathToCache || !nodeImportMapPath) return nextResolve(specifier);

    const importmap = constructImportMap(nodeImportMapPath)
    if (!importmap) return nextResolve(specifier);

    const cacheMapPath = cacheMap.get(pathToCache)
    if (!cacheMapPath) return nextResolve(specifier);

    const modulePath = importmap.resolve(specifier, cacheMapPath)
    const { protocol } = new URL(modulePath);
    const isNode = protocol === "node:";
    const isFile = protocol === "file:";
    if (isNode || isFile) return nextResolve(specifier);

    const nodeModuleCachePath = getPackageNameVersionFromUrl(modulePath);
    cacheMap.set(`file://${nodeModuleCachePath}`, modulePath);
    const parsedNodeModuleCachePath = await parseNodeModuleCachePath(modulePath, nodeModuleCachePath, debug);
    return nextResolve(parsedNodeModuleCachePath);
  } catch (err) {
    if (debug) console.log(`resolve: Failed in resolving ${err}`);
    return nextResolve(specifier);
  }
};
