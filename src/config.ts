import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImportMap } from "@jspm/import-map";
import { argv } from "node:process";
import { Options } from "./types";

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

function parseArgs({ args, options: optionDefinitions }: Options) {
  return {
    values: args.reduce((parsedArgs: Record<string, string | boolean>, arg, index, arr) => {
      if (arg.startsWith("-")) {
        const optionName = arg.replace(/^-+/, "");
        const optionDefinition = optionDefinitions[optionName];
        if (optionDefinition) {
          const value = arr[index + 1];
          parsedArgs[optionDefinition.alias || optionName] =
            value !== undefined ? value : optionDefinition.default || true;
        }
      }
      return parsedArgs;
    }, {}),
  };
}

const { values } = parseArgs({
  args: argv.slice(2),
  options: { "debug-node-loader": { alias: "d", type: "boolean", default: false } },
});

export const isDebuggingEnabled = (): boolean => values["debug-node-loader"] as boolean;
