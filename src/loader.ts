import { join } from "node:path";
import { parseUrlPkg } from "@jspm/generator";
import { cache, cacheMap, nodeImportMapPath } from "./config";
import { constructImportMap } from "./utils";
import { parseNodeModuleCachePath } from "./parser";
import { IS_DEBUGGING } from "./constants";
import { logger } from "./logger";
import { Context, NextResolve } from "./types";

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
 * ******************************************************
 */

const log = logger({ file: "loader" });
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
  if (!parentURL || !nodeImportMapPath) return nextResolve(specifier);

  const importmap = constructImportMap(nodeImportMapPath);
  log.debug("resolve:importmap:", { importmap });
  const cacheMapPath = cacheMap.get(parentURL) || parentURL;
  log.debug("resolve:cacheMapPath:", { cacheMapPath });

  // construct module path
  const modulePath = importmap.resolve(specifier, cacheMapPath);
  log.debug("resolve:modulePath:", { modulePath });

  // resolve URL
  const { protocol = "" } = new URL(modulePath);
  const isNode = protocol === "node:";
  const isFile = protocol === "file:";
  log.debug("resolve:protocol:", { isNode, isFile });
  if (isNode || isFile) return nextResolve(specifier);

  // get node module information
  try {
    const moduleMetadata = await parseUrlPkg(modulePath);
    // debugged to here
    log.debug("resolve:moduleMetaData:", { moduleMetadata });
    if (!moduleMetadata) return nextResolve(specifier);

    // construct node module cache path
    const {
      pkg: { name, version },
    } = moduleMetadata;
    const moduleFile = modulePath.split("/").reverse()[0] || "";
    const nodeModuleCachePath = join(cache, `${name}@${version}`, moduleFile);
    cacheMap.set(`file://${nodeModuleCachePath}`, modulePath);
    const parsedNodeModuleCachePath = await parseNodeModuleCachePath(modulePath, nodeModuleCachePath);
    log.debug("resolve:nodeModuleCachePath:", { nodeModuleCachePath, parsedNodeModuleCachePath });

    // resolve node module cache path
    return nextResolve(parsedNodeModuleCachePath);
  } catch (err) {
    log.error(`resolve: ${err}`);
    return nextResolve(specifier);
  }
};
