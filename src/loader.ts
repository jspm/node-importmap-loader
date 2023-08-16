import { cacheMap, nodeImportMapPath } from "./config";
import {
  checkIfNodeOrFileProtocol,
  resolveNodeModuleCachePath,
  resolveModulePath,
  resolveParsedModulePath,
} from "./utils";
import { Context, NextResolve } from "./types";

/**
 * ******************************************************
 * LOADER
 * ------------------------------------------------------
 * @summary loads node modules via an *assumed root working directory with a cache and node.importmap*
 * @notes
 * The node loader api is being redesigned.
 * JSPM will update to the new api when it is stable and
 * aim to maintain this loader without breaking it's core functionality
 * ------------------------------------------------------
 * @sources :
 * * https://nodejs.org/api/esm.html#esm_experimental_loaders
 * * https://github.com/nodejs/loaders-test
 * ******************************************************
 */

/**
 * resolve
 * @description resolves modules, this function is called by the loader automatically
 * @param {string} specifier
 * @param {object} context
 * @param {callback} nextResolve
 * @returns {function} nextResolve
 */
export const resolve = async (specifier: string, { parentURL }: Context, nextResolve: NextResolve) => {
  if (!parentURL || !nodeImportMapPath) return nextResolve(specifier);
  const cacheMapPath = cacheMap.get(parentURL) || parentURL;
  const modulePath = resolveModulePath(specifier, cacheMapPath);
  const isNodeOrFileProtocol = checkIfNodeOrFileProtocol(modulePath);
  if (isNodeOrFileProtocol) return nextResolve(specifier);
  const nodeModuleCachePath = await resolveNodeModuleCachePath(modulePath);
  if (!nodeModuleCachePath) return nextResolve(specifier);
  cacheMap.set(`file://${nodeModuleCachePath}`, modulePath);
  const parsedNodeModuleCachePath = await resolveParsedModulePath(modulePath, nodeModuleCachePath);
  if (!parsedNodeModuleCachePath) return nextResolve(specifier);
  return nextResolve(parsedNodeModuleCachePath);
};
