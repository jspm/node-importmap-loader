import { parseUrlPkg } from "@jspm/generator";
import { cache, cacheMap, nodeImportMapPath } from "./config";
import { IS_DEBUGGING } from "./constants";
import { constructImportMap, constructPath, parseNodeModuleCachePath } from "./utils";
import { Context, NextResolve } from "./types";
import { logger } from "./logger";

const log = logger({ file: "loader" });

/**
 * ******************************************************
 * LOADER
 * ------------------------------------------------------
 * @description generates a node.importmap
 * @summary loads node modules via an *assumed root working directory with a cache and node.importmap*
 * @notes
 * The node loader api is being redesigned.
 * JSPM will update to the new api when it is stable and
 * aim to maintain this loader without breaking it's core functionality
 * ------------------------------------------------------
 * @sources :
 * * https://nodejs.org/api/esm.html#esm_experimental_loaders
 * * https://github.com/nodejs/loaders-test
 * TODO: should the working directory be assumed? should the cache path importmap path, and importmap filename be assumed?
 * ******************************************************
 */

log.setLogger(IS_DEBUGGING);

/**
 * resolve
 * @description a convenience function to resolve the modules, this function is called by the loader automatically
 * @param {string} specifier
 * @param {object} context
 * @param {callback} nextResolve
 * @returns {function} nextResolve
 */

export const resolve = async (specifier: string, { parentURL }: Context, nextResolve: NextResolve) => {
  try {
    // define cache path
    const pathToCache = cache || parentURL;
    log.debug("resolve:pathToCache:", { pathToCache });
    if (!pathToCache) throw new Error("Failed in resolving cache path");

    // construct importmap
    const importmap = constructImportMap(nodeImportMapPath);
    log.debug("resolve:importmap:", { importmap });

    // construct cache map path
    const cacheMapPath = cacheMap.get(pathToCache) || pathToCache;
    log.debug("resolve:cacheMapPath:", { cacheMapPath });

    // construct module path
    const modulePath = importmap.resolve(specifier, cacheMapPath);
    log.debug("resolve:modulePath:", { modulePath });
    if (!modulePath) throw new Error("Failed in resolving module path");

    // resolve URL
    const { protocol = "" } = new URL(modulePath);
    const isNode = protocol === "node:";
    const isFile = protocol === "file:";
    log.debug("resolve:protocol:", { protocol, isNode, isFile });
    if (isNode || isFile) {
      log.debug("Failed resolving a protocol");
      return nextResolve(specifier);
    }

    // get node module information
    const moduleMetadata = await parseUrlPkg(modulePath);
    log.debug("resolve:moduleMetaData:", { moduleMetadata });
    if (!moduleMetadata) {
      log.debug("Failed in parsing module meta data");
      return nextResolve(specifier);
    }

    // construct node module cache path
    const {
      pkg: { name, version },
    } = moduleMetadata;
    const nodeModuleCachePath = constructPath(`${name}@${version}`, pathToCache);
    cacheMap.set(`file://${nodeModuleCachePath}`, modulePath);
    const parsedNodeModuleCachePath = await parseNodeModuleCachePath(modulePath, nodeModuleCachePath);
    log.debug("resolve:nodeModuleCachePath:", { nodeModuleCachePath, parsedNodeModuleCachePath });
    if (!parsedNodeModuleCachePath) throw new Error("Failed in parsing node module cache path");

    // resolve node module cache path
    return nextResolve(parsedNodeModuleCachePath);
  } catch (err) {
    log.error(`resolve: ${err}`);
    return nextResolve(specifier);
  }
};
