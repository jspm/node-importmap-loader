import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImportMap } from "@jspm/import-map";
import fetch from "node-fetch";
import { ensureFileSync } from "fs-extra";
import { ConstructCachePath, Context, NextResolve } from './types'

// matches the name and version of an npm package
const EXTRACT_PACKAGE_NAME_AND_VERSION = /@[~^]?([\dvx*]+(?:[-.](?:[\dx*]+|alpha|beta))*)/;
// hoist the cache map
const cacheMap = new Map();

/**
 * constructPath
 * @description a convenience function to construct a path
 * @param root string
 * @returns string
 */
export const constructPath = (dir: string, root = '.') => join(root, dir)

/**
 * constructLoaderPaths
 * @description a convenience function to construct the loader paths
 * @param base string
 * @param url string
 * @returns object
 */
export const constructLoaderConfig = (base = '.', url = import.meta.url) => {
  const root = fileURLToPath(new URL(base, url))
  const cachePath = constructPath('.cache', root)
  const hasCacheFolder = existsSync(cachePath)
  if (!hasCacheFolder) mkdirSync(cachePath, { recursive: true })
  return {
    root,
    cache: constructPath('.cache', root),
    nodeImportMapPath: join(root, "node.importmap") || '',
  }
}

/**
 * constructImportMap
 * @description a convenience function to construct an import map
 * @param path
 * @returns ImportMap
 */
export const constructImportMap = (path = '') => {
  const map = existsSync(path)
    ? JSON.parse(readFileSync(path, { encoding: "utf8" }))
    : {}
  return new ImportMap({
    rootUrl: import.meta.url,
    map,
  })
}

export const constructCachePath = ({
  cache,
  modulePath,
  debug = false,
  matcher = EXTRACT_PACKAGE_NAME_AND_VERSION
}: ConstructCachePath) => {
  const { pathname } = new URL(modulePath);
  const urlParts = pathname.match(
    matcher
  );
  if (!urlParts) {
    if (debug) console.error(`no match for ${modulePath}`);
    return ''
  }
  const [, packageName, version, filePath] = urlParts;
  if (debug) console.log(`${packageName}@${version}`);
  return join(cache, `${packageName}@${version}`, filePath);
}

/**
 * resolve
 * @description a convenience function to resolve the modules, this function is called by the loader automatically
 * @param specifier string
 * @param context object
 * @param nextResolve callback
 * @returns string
 */
export const resolve = async (specifier: string, { parentURL }: Context, nextResolve: NextResolve, debug = false) => {
  const { nodeImportMapPath } = constructLoaderConfig()
  if (!parentURL || !nodeImportMapPath) return nextResolve(specifier);

  try {
    const importmap = constructImportMap(nodeImportMapPath)
    const modulePath = importmap.resolve(
      specifier,
      cacheMap.get(parentURL) || parentURL
    );
    const moduleCachePath = await parseModule(specifier, modulePath);
    return nextResolve(moduleCachePath);
  } catch (error) {
    if (debug) console.log(error);
    return nextResolve(specifier);
  }
};

/**
 * parseModule
 * @description a convenience function to parse the modules, this function is called by the loader automatically
 * @param specifier string
 * @param modulePath string
 * @returns
 */
export const parseModule = async (specifier: string, modulePath: string) => {
  const { cache } = constructLoaderConfig()
  const { protocol } = new URL(modulePath);
  const isNode = protocol === "node:";
  const isFile = protocol === "file:";
  if (isNode || isFile) return specifier;

  const cachePath = constructCachePath({ cache, modulePath })
  cacheMap.set(`file://${cachePath}`, modulePath);
  if (existsSync(cachePath)) return cachePath

  const code = await (await fetch(modulePath)).text();
  ensureFileSync(cachePath);
  writeFileSync(cachePath, code);

  return cachePath;
};
