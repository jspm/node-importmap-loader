import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ImportMap } from "@jspm/import-map";
import fetch from "node-fetch";
import { ConstructCachePath, Context, NextResolve, UrlType } from './types'

// hoist the cache map
const cacheMap = new Map();

/**
 * nsureDirSync
 * @description a function to ensure the dis exists
 * @param dirPath
*/

function ensureDirSync(dirPath: string) {
  if (existsSync(dirPath)) {
    return;
  }

  const parentDir = dirname(dirPath);
  if (parentDir !== dirPath) {
    ensureDirSync(parentDir);
  }

  mkdirSync(dirPath);
}

/**
 * ensureFileSync
 * @description a convenience function to ensure a file exists
 * @param path
 */
function ensureFileSync(path: string) {
  const dirPath = dirname(path);

  if (!existsSync(dirPath)) {
    ensureDirSync(dirPath);
  }

  try {
    writeFileSync(path, '', { flag: 'wx' });
  } catch {
    throw new Error(`Failed in creating ${path}`)
  }
}

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
export const constructLoaderConfig = (base = '.', url: UrlType | string = import.meta.url || '') => {
  const urlPath = new URL(base, url)
  const root = fileURLToPath(urlPath)
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
export const constructImportMap = (path = '', rootUrl = import.meta.url) => {
  const map = existsSync(path)
    ? JSON.parse(readFileSync(path, { encoding: "utf8" }))
    : {}
  return new ImportMap({
    rootUrl,
    map,
  })
}

/**
 * getVersion
 * @description a convenience function to get the version from a url
 * @param urlParts
 * @returns fn
 */
export const getVersion = (urlParts: string[]) => (index: number) => urlParts?.[index]?.split('/')?.[0] || '';

/**
 * getLastPart
 * @description a convenience function to get the last part of a string
 * @param part
 * @param char
 * @returns string
 */
export const getLastPart = (part: string, char: string) => part.length && char && part.split(char).reverse()[0] || '';

/**
 * getPackageNameVersionFromUrl
 * @description a convenience function to get the package name and version from a url
 * @param url
 * @param debug
 * @returns object
 */
export const getPackageNameVersionFromUrl = (url: string, debug = false) => {
  const urlParts = url.split('@');
  const urlPartsCount = urlParts.length;
  const file = getLastPart(url, '/');
  let name = '';
  let version = '';
  if (urlPartsCount > 3 && debug) console.error(`Too many @'s in ${url}. Is this a valid url?`);
  else if (!urlPartsCount && debug) console.error(`No @'s in ${url}. Is this a valid url?`);
  else if (urlPartsCount === 3) {
    name = `@${urlParts[1]}`;
    version = getVersion(urlParts)(2);
  } else {
    name = getLastPart(getLastPart(urlParts[0], '/'), ':');
    version = getVersion(urlParts)(1);
  }
  return {
    file,
    name,
    version,
  };
};

/**
 * constructCachePath
 * @description a convenience function to construct the cache path
 * @param cache string
 * @param modulePath string
 * @returns string
 */
export const constructCachePath = ({
  cache,
  modulePath,
  debug = false,
}: ConstructCachePath) => {
  const { name, version, file } = getPackageNameVersionFromUrl(modulePath, debug);
  if (debug) console.log(`${name}@${version}`);
  return join(cache, `${name}@${version}`, file);
}

/**
 * resolve
 * @description a convenience function to resolve the modules, this function is called by the loader automatically
 * @param specifier string
 * @param context object
 * @param nextResolve callback
 * @returns string
 */
export const resolve = async (specifier: string, { parentURL }: Context, nextResolve: NextResolve) => {
  const { nodeImportMapPath } = constructLoaderConfig()
  if (!parentURL || !nodeImportMapPath) return nextResolve(specifier);

    const importmap = constructImportMap(nodeImportMapPath)
    const modulePath = importmap.resolve(
      specifier,
      cacheMap.get(parentURL) || parentURL
    );
    const moduleCachePath = await parseModule(specifier, modulePath);
    return nextResolve(moduleCachePath);
};

/**
 * parseModule
 * @description a convenience function to parse the modules, this function is called by the loader automatically
 * @param specifier string
 * @param modulePath string
 * @returns string
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
  const code = await (await fetch(modulePath).then(response => {
    if (!response.ok) {
      throw Error(`404: Module not found: ${modulePath}`);
    }
    return response;
  })).text();

  ensureFileSync(cachePath);
  writeFileSync(cachePath, code);

  return cachePath;
};
