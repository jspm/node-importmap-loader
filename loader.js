import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImportMap } from "@jspm/import-map";
import fetch from "node-fetch";
import { ensureFileSync } from "fs-extra";
const EXTRACT_PACKAGE_NAME_AND_VERSION = /@[~^]?([\dvx*]+(?:[-.](?:[\dx*]+|alpha|beta))*)/;
const cacheMap = new Map();
export const constructPath = (dir, root = '.') => join(root, dir);
export const constructLoaderConfig = (base = '.', url = import.meta.url) => {
    const root = fileURLToPath(new URL(base, url));
    const cachePath = constructPath('.cache', root);
    const hasCacheFolder = existsSync(cachePath);
    if (!hasCacheFolder)
        mkdirSync(cachePath, { recursive: true });
    return {
        root,
        cache: constructPath('.cache', root),
        nodeImportMapPath: join(root, "node.importmap") || '',
    };
};
export const constructImportMap = (path = '') => {
    const map = existsSync(path)
        ? JSON.parse(readFileSync(path, { encoding: "utf8" }))
        : {};
    return new ImportMap({
        rootUrl: import.meta.url,
        map,
    });
};
export const constructCachePath = ({ cache, modulePath, debug = false, matcher = EXTRACT_PACKAGE_NAME_AND_VERSION }) => {
    const { pathname } = new URL(modulePath);
    const urlParts = pathname.match(matcher);
    if (!urlParts) {
        if (debug)
            console.error(`no match for ${modulePath}`);
        return '';
    }
    const [, packageName, version, filePath] = urlParts;
    if (debug)
        console.log(`${packageName}@${version}`);
    return join(cache, `${packageName}@${version}`, filePath);
};
export const resolve = async (specifier, { parentURL }, nextResolve, debug = false) => {
    const { nodeImportMapPath } = constructLoaderConfig();
    if (!parentURL || !nodeImportMapPath)
        return nextResolve(specifier);
    try {
        const importmap = constructImportMap(nodeImportMapPath);
        const modulePath = importmap.resolve(specifier, cacheMap.get(parentURL) || parentURL);
        const moduleCachePath = await parseModule(specifier, modulePath);
        return nextResolve(moduleCachePath);
    }
    catch (error) {
        if (debug)
            console.log(error);
        return nextResolve(specifier);
    }
};
export const parseModule = async (specifier, modulePath) => {
    const { cache } = constructLoaderConfig();
    const { protocol } = new URL(modulePath);
    const isNode = protocol === "node:";
    const isFile = protocol === "file:";
    if (isNode || isFile)
        return specifier;
    const cachePath = constructCachePath({ cache, modulePath });
    cacheMap.set(`file://${cachePath}`, modulePath);
    if (existsSync(cachePath))
        return cachePath;
    const code = await (await fetch(modulePath)).text();
    ensureFileSync(cachePath);
    writeFileSync(cachePath, code);
    return cachePath;
};
