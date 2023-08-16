import { join } from "node:path";
import { fileURLToPath } from "node:url";
/**
 * ******************************************************
 * CONFIG
 * ------------------------------------------------------
 * @description utility variable assignment
 * @summary utility variables which are assigned 1x. Assigning them here simplifies testability and later configuration if CLI functionality is added.
 *
 * ******************************************************
 */
export const root = fileURLToPath(`file://${process.cwd()}`);
export const cacheMap = new Map();
export const nodeImportMapPath = join(root, "node.importmap");
export const cache = join(root, ".cache");
