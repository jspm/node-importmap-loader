import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImportMap } from "@jspm/import-map";
import fetch from "node-fetch";
import { ensureDirSync, ensureFileSync } from "fs-extra";

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
    ? JSON.parse(
        readFileSync(join(root, "node.importmap"), { encoding: "utf8" })
      )
    : {},
});

export const resolve = async (specifier, context, nextResolve) => {
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

const parseModule = async (specifier, modulePathToFetch) => {
  const url = new URL(modulePathToFetch);
  if (url.protocol === "node:" || url.protocol === "file:") {
    return specifier;
  }

  const moduleURL = new URL(modulePathToFetch);
  const [, packageName, , filePath] = moduleURL.pathname.match(
    extractPackageNameAndVersion
  );
  console.log(packageName);

  const cachePath = join(cache, packageName, filePath);
  cacheMap.set(`file://${cachePath}`, modulePathToFetch);
  const code = await (await fetch(modulePathToFetch)).text();
  ensureFileSync(cachePath);
  writeFileSync(cachePath, code);

  return cachePath;
};
