import { parseUrlPkg } from "@jspm/generator";
import {
  constructPath,
  constructImportMap,
  constructUrlPath,
  createCacheMap,
  parseNodeModuleCachePath,
  processCliArgs,
} from "src/utils";
import { Context, NextResolve, ResolveOptions } from "src/types";
import { logger } from './logger'

const log = logger({ file: "loader" });

/**
 * ******************************************************
 * LOADER
 * ------------------------------------------------------
 * @description the resolver for a node command
 * @summary TODO: add summary
 *
 * ******************************************************
 */

const config = processCliArgs(process.argv) || {};
const initialCacheMap = createCacheMap(config?.values?.debug);

/**
 * resolve
 * @description a convenience function to resolve the modules, this function is called by the loader automatically
 * @param {string} specifier
 * @param {object} context
 * @param {callback} nextResolve
 * @returns {function} nextResolve
 */

export const resolve = async (
  specifier: string,
  { parentURL }: Context,
  nextResolve: NextResolve,
  options: ResolveOptions = config?.values,
) => {
  const { basePath, cachePath, debug: isDebugging = false, importmapPath, cacheMap = initialCacheMap } = options || {};
  log.setLogger(isDebugging)
  try {
    // define importmap path
    const cwd = process.cwd();
    const pathToImportMap = importmapPath || constructUrlPath(basePath, cwd, isDebugging);
    const nodeImportMapPath = constructPath("node.importmap", pathToImportMap);
    log.debug("resolve:nodeImportMapPath:", { cwd, pathToImportMap, nodeImportMapPath });
    if (!nodeImportMapPath) throw new Error("Failed in resolving import map path");

    // define cache path
    const pathToCache = cachePath || parentURL;
    log.debug("resolve:pathToCache:", { pathToCache });
    if (!pathToCache) throw new Error("Failed in resolving cache path");

    // construct importmap
    const importmap = constructImportMap(nodeImportMapPath);
    log.debug("resolve:importmap:", { importmap });
    if (!importmap) throw new Error("Failed in constructing import map");

    // construct cache map path
    const cacheMapPath = cacheMap.get(pathToCache);
    log.debug("resolve:cacheMapPath:", { cacheMapPath });
    if (!cacheMapPath) throw new Error("Failed in resolving cache map path");

    // construct module path
    const modulePath = importmap.resolve(specifier, cacheMapPath);
    log.debug("resolve:modulePath:", { modulePath });
    if (!modulePath) throw new Error("Failed in resolving module path");

    // resolve URL
    const { protocol = "" } = new URL(modulePath);
    const isNode = protocol === "node:";
    const isFile = protocol === "file:";
    log.debug("resolve:protocol:", { protocol, isNode, isFile });
    if (isNode || isFile) throw new Error("Failed in resolving URL");

    // get node module information
    const moduleMetaData = await parseUrlPkg(modulePath);
    log.debug("resolve:moduleMetaData:", { moduleMetaData });
    if (!moduleMetaData) throw new Error("Failed in parsing module meta data");

    // construct node module cache path
    const {
      pkg: { name, version },
    } = moduleMetaData;
    const nodeModuleCachePath = constructPath(`${name}@${version}`, pathToCache);
    cacheMap.set(`file://${nodeModuleCachePath}`, modulePath);
    const parsedNodeModuleCachePath = await parseNodeModuleCachePath(modulePath, nodeModuleCachePath, isDebugging);
    log.debug("resolve:nodeModuleCachePath:", { nodeModuleCachePath, parsedNodeModuleCachePath });
    if (!parsedNodeModuleCachePath) throw new Error("Failed in parsing node module cache path");

    // resolve node module cache path
    return nextResolve(parsedNodeModuleCachePath);
  } catch (err) {
    log.error(`resolve: ${err}`);
    return nextResolve(specifier);
  }
};
