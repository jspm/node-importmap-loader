import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseUrlPkg } from "@jspm/generator";
import { parseNodeModuleCachePath } from "./parser";
import { cache, importmap } from "./config";
import { IS_DEBUGGING } from "./constants";
import { logger } from "./logger";

/**
 * ******************************************************
 * UTILS 📦
 * ------------------------------------------------------
 * @description a collection of utility functions
 * @summary a collection of utility functions
 * which aren't reliant on each other (for easy testability)
 *
 * ******************************************************
 */

const log = logger({ file: "loader", isLogging: IS_DEBUGGING });

export const ensureDirSync = (dirPath: string) => {
  if (existsSync(dirPath)) return;
  const parentDir = dirname(dirPath);
  if (parentDir !== dirPath) ensureDirSync(parentDir);
  mkdirSync(dirPath);
};

export const ensureFileSync = (path: string) => {
  const dirPath = dirname(path);
  if (!existsSync(dirPath)) ensureDirSync(dirPath);
  try {
    writeFileSync(path, "", { flag: "wx" });
  } catch {
    log.error(`ensureDirSync: Failed in creating ${path}`);
  }
};

export const checkIfNodeOrFileProtocol = (modulePath: string) => {
  const { protocol = "" } = new URL(modulePath);
  const isNode = protocol === "node:";
  const isFile = protocol === "file:";
  return isNode || isFile;
};

export const resolveModulePath = (specifier: string, cacheMapPath: string) => {
  const modulePath = importmap.resolve(specifier, cacheMapPath);
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
    log.debug("resolveNodeModuleCachePath:", { nodeModuleCachePath });
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
