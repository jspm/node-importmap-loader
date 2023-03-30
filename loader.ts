import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImportMap } from "@jspm/import-map";
import fetch from "node-fetch";
import { ensureDirSync, ensureFileSync } from "fs-extra";
import { Context, NextResolve } from './types'

const cacheMap = new Map();
const root = fileURLToPath(new URL(".", import.meta.url));
const cache = join(root, ".cache");
ensureDirSync(cache);
const nodeImportMapPath = join(root, "node.importmap");
const extractPackageNameAndVersion =
  /^\/npm:((?:@[^\/\\%@]+\/)?[^.\/\\%@][^\/\\%@]*)@([^\/]+)(\/.*)?$/;

const importmap = new ImportMap({
  rootUrl: import.meta.url,
  map: existsSync(nodeImportMapPath)
    ? JSON.parse(readFileSync(nodeImportMapPath, { encoding: "utf8" }))
    : {},
});

export const resolve = async (specifier: string, context: Context, nextResolve: NextResolve) => {
  if (!context.parentURL || !nodeImportMapPath) {
    return nextResolve(specifier);
  }

  try {
    const modulePathFromMap = importmap.resolve(
      specifier,
      cacheMap.get(context.parentURL) || context.parentURL
    );
    const moduleCachePath = await parseModule(specifier, modulePathFromMap);
    return nextResolve(moduleCachePath);
  } catch (error) {
    console.log(error);
  }

  return nextResolve(specifier);
};

export const parseModule = async (specifier: string, modulePathToFetch: string) => {
  const url = new URL(modulePathToFetch);
  if (url.protocol === "node:" || url.protocol === "file:") {
    return specifier;
  }

  const moduleURL = new URL(modulePathToFetch);
  const [, packageName, version, filePath]: any = moduleURL.pathname.match(
    extractPackageNameAndVersion
  );
  console.log(`${packageName}@${version}`);
  const cachePath = join(cache, `${packageName}@${version}`, filePath);
  cacheMap.set(`file://${cachePath}`, modulePathToFetch);

  if (existsSync(cachePath)) {
    return cachePath
  }

  const code = await (await fetch(modulePathToFetch)).text();
  ensureFileSync(cachePath);
  writeFileSync(cachePath, code);

  return cachePath;
};
