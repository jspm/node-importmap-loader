import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseUrlPkg } from "@jspm/generator";
import { parseNodeModuleCachePath } from "./parser";
import { cache, importmap, isDebuggingEnabled as isLogging } from "./config";
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

const log = logger({ file: "loader", isLogging });

export const ensureDirSync = (dirPath: string) => {
  try {
    mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    log.error(`ensureDirSync: Failed in creating ${dirPath}`, { error: err });
    throw err;
  }
};

export const ensureFileSync = (path: string) => {
  try {
    const dirPath = dirname(path);
    if (!existsSync(dirPath)) ensureDirSync(dirPath);
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

export const resolveModulePath = (specifier: string, cacheMapPath: string): string | null => {
  try {
    const modulePath = importmap.resolve(specifier, cacheMapPath);
    log.debug("resolveModulePath:", { modulePath });
    return modulePath;
  } catch {
    /*
      If a module is not found in the importmap, we should just let the loader to skip it.
      - Users might have installed it using `npm`.
      - It can be a node-js dependency. (e.g. `assert`). We detect builtins using `node:` protocol.
        But it is still not widely adopted yet.
    */
    log.debug(`Failed in resolving ${specifier} in ${cacheMapPath}`);
    return null;
  }
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
