import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseUrlPkg } from "@jspm/generator";
import { parseNodeModuleCachePath } from "src/parser";
import { cache, importMap } from "src/config";
import { IS_DEBUGGING } from "src/constants";
import { logger } from "src/logger";

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

const log = logger({ file: "loader" });
log.setLogger(IS_DEBUGGING);

export const ensureDirSync = (dirPath: string) => {
  if (existsSync(dirPath)) return;
  const parentDir = dirname(dirPath);
  if (parentDir !== dirPath) ensureDirSync(parentDir);
  mkdirSync(dirPath);
};

export const isNodeOrFileProtocol = (modulePath: string) => {
  const { protocol = "" } = new URL(modulePath);
  const isNode = protocol === "node:";
  const isFile = protocol === "file:";
  return isNode || isFile;
};

export const resolveModulePath = (specifier: string, cacheMapPath: string) => {
  const modulePath = importMap.resolve(specifier, cacheMapPath);
  log.debug("resolveModulePath:", { modulePath });
  return modulePath;
};

export const resolveNodeModuleCachePath = async (modulePath: string) => {
  try {
    const moduleMetadata = await parseUrlPkg(modulePath);
    const name = moduleMetadata?.pkg?.name;
    const version = moduleMetadata?.pkg?.version;
    const moduleFile = modulePath.split("/").reverse()[0] || "";
    const nodeModuleCachePath = join(cache, `${name}@${version}`, moduleFile);
    log.debug("resolveNodeModuleCachePath:", { name, version, nodeModuleCachePath });
    return nodeModuleCachePath;
  } catch (err) {
    log.error("resolveNodeModuleCachePath:", err);
    return;
  }
};

export const resolveParsedModulePath = async (modulePath: string, nodeModuleCachePath: string) => {
  try {
    const parsedNodeModuleCachePath = await parseNodeModuleCachePath(modulePath, nodeModuleCachePath);
    log.debug("resolveParsedModulePath:", { nodeModuleCachePath, parsedNodeModuleCachePath });
    return parsedNodeModuleCachePath;
  } catch (err) {
    log.error("resolveParsedModulePath:", err);
    return;
  }
};
