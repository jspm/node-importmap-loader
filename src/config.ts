import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImportMap } from "@jspm/import-map";
import { parseArgs } from "./parseArgs";
import { argv } from "node:process";

/**
 * ******************************************************
 * CONFIG 🗺️
 * ------------------------------------------------------
 * @description utility variable assignment
 * @summary utility variables which are assigned 1x.
 * Assigning them here simplifies testability and later configuration if CLI functionality is added.
 *
 * ******************************************************
 */
export const root = fileURLToPath(`file://${process.cwd()}`);
export const cacheMap = new Map();
export const nodeImportMapPath = join(root, "node.importmap");
export const cache = join(root, ".cache");
const map = existsSync(nodeImportMapPath) ? JSON.parse(readFileSync(nodeImportMapPath, { encoding: "utf8" })) : {};
export const importmap = new ImportMap({ rootUrl: import.meta.url, map });

export const options = parseArgs({
  args: argv.slice(2),
  options: { debugNodeImportmapLoader: { alias: "d", type: "boolean", default: false } },
});

export const isDebuggingEnabled = Boolean(options.debugNodeImportmapLoader);
