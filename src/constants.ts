export const NO_CACHE_MAP_DEFINED =
  "No parentURL provided. No cachePath was defined. Couldn't get cachePath from cacheMap.";
export const ALL_CACHE_MAP_REQUIREMENTS_MUST_BE_DEFINED = "All cacheMap requirements must be defined.";

export const IS_DEBUGGING = process.env.DEBUG === "true";
export const IS_TESTING = process.env.TESTING === "true";

/**
 * TODO: [CLI]: this should be update so that it can act as a friendly wrapper to the loader
 */
export const PROCESS_CONFIG_OPTIONS = {
  base: {
    type: <const>"string",
    short: "b",
  },
  cache: {
    type: <const>"string",
    short: "c",
  },
  debug: {
    type: <const>"boolean",
    short: "d",
  },
  importmap: {
    type: <const>"string",
    short: "i",
  },
};
