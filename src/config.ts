import { IS_DEBUGGING } from "src/constants";
import { constructPath, createCacheMap } from "src/utils";

/**
 * ******************************************************
 * CONFIG
 * ------------------------------------------------------
 * @description utility variable assignment
 * @summary utility variables which are assigned 1x. Assigning them here simplifies testability and later configuration if CLI functionality is added.
 *
 * ******************************************************
 */
const root = process.cwd();
export const cacheMap = createCacheMap(IS_DEBUGGING);
export const cache = constructPath(".cache", root);
export const nodeImportMapPath = constructPath("node.importmap", root);
