export const NO_CACHE_MAP_DEFINED =
  "No parentURL provided. No cachePath was defined. Couldn't get cachePath from cacheMap.";
export const ALL_CACHE_MAP_REQUIREMENTS_MUST_BE_DEFINED = "All cacheMap requirements must be defined.";

export const PROCESS_CLI_ARGS_OPTIONS = {
  basePath: {
    type: <const>"string",
    short: "b",
  },
  cachePath: {
    type: <const>"string",
    short: "c",
  },
  debug: {
    type: <const>"boolean",
    short: "d",
  },
  importmapPath: {
    type: <const>"string",
    short: "i",
  },
};
