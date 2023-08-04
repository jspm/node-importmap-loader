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
import { logger } from "./logger";

const log = logger({ file: "loader" });

/**
 * ******************************************************
 * LOADER
 * ------------------------------------------------------
 * @description generates a node.importmap
 * @summary TODO: add s
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

// TODO: fix
const config = processCliArgs(process.argv) || {};
const values: ResolveOptions = config?.values || {};
const cache = values?.cache || "";
const importmap = values?.importmap || constructUrlPath();
const isDebugging = values?.debug || false;
const cacheMap = createCacheMap(isDebugging);
const nodeImportMapPath = constructPath("node.importmap", importmap);

/**
 * resolve
 * @description a convenience function to resolve the modules, this function is called by the loader automatically
 * @param {string} specifier
 * @param {object} context
 * @param {callback} nextResolve
 * @returns {function} nextResolve
 */

export const resolve = async (specifier: string, { parentURL }: Context, nextResolve: NextResolve) => {
  // TODO: fix
  log.setLogger(isDebugging);
  try {
    // define cache path
    const pathToCache = cache || parentURL;
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
    if (isNode || isFile) {
      log.debug("Failed reoslving a protocol");
      return nextResolve(specifier);
    }

    // get node module information
    const moduleMetaData = await parseUrlPkg(modulePath);
    log.debug("resolve:moduleMetaData:", { moduleMetaData });
    if (!moduleMetaData) {
      log.debug("Failed in parsing module meta data");
      return nextResolve(specifier);
    }

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
