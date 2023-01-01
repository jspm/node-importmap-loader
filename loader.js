import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImportMap } from "@jspm/import-map";
import fetch from "node-fetch";
import { parse, init } from "es-module-lexer";
import { ensureDirSync } from "fs-extra";

await init;
const cacheMap = new Map();
const root = fileURLToPath(new URL(".", import.meta.url));
const cache = join(root, ".cache");
ensureDirSync(cache);

const mapPath = join(root, "node.importmap");
const importmap = new ImportMap({
  map: JSON.parse(readFileSync(mapPath)),
});

export const resolve = async (specifier, context, nextResolve) => {
  if (!context.parentURL) {
    return nextResolve(specifier);
  }

  try {
    const modulePathToFetch = importmap.resolve(specifier, context.parentURL);
    const moduleCachePath = await parseModule(specifier, modulePathToFetch);
    return nextResolve(moduleCachePath);
  } catch (e) {
    if (specifier.startsWith(".")) {
      return nextResolve(join(dirname(context.parentURL), specifier));
    }
    const modulePathToFetch = importmap.resolve(
      specifier,
      cacheMap.get(specifier)
    );
    const moduleCachePath = await parseModule(specifier, modulePathToFetch);
    return nextResolve(moduleCachePath);
  }
};

const parseModule = async (specifier, modulePathToFetch) => {
  const url = new URL(modulePathToFetch);
  if (url.protocol === "node:") {
    return specifier;
  }

  const folder = join(cache, specifier);
  const moduleCachePath = join(folder, `index.js`);
  const code = await (await fetch(modulePathToFetch)).text();
  ensureDirSync(folder);
  writeFileSync(moduleCachePath, code);
  const [imports] = parse(code);
  for (var i = 0; i < imports.length; i++) {
    const { n } = imports[i];
    if (n.startsWith(".")) {
      const relativePath = join(cache, specifier, n);
      const relativeURL = new URL(join(modulePathToFetch, "../", n)).toString();
      const code = await (await fetch(relativeURL)).text();
      ensureDirSync(dirname(relativePath));
      writeFileSync(relativePath, code);
    } else {
      cacheMap.set(n, modulePathToFetch);
    }
  }
  return moduleCachePath;
};
