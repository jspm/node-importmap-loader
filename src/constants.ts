export const NO_CACHE_MAP_DEFINED =
  "No parentURL provided. No cachePath was defined. Couldn't get cachePath from cacheMap.";
export const ALL_CACHE_MAP_REQUIREMENTS_MUST_BE_DEFINED = "All cacheMap requirements must be defined.";

const isDebugging = process.env.DEBUG === "true";
const isTesting = process.env.TESTING === "true";

export const PROCESS_TESTING_CLI_ARGS_OPTIONS = {
  base: {
    type: <const>"string",
    short: "b",
  },
  cache: {
    type: <const>"string",
    short: "c",
  },
};

export const PROCESS_DEFAULT_ARGS_OPTIONS = {
  debug: {
    type: <const>"boolean",
    short: "d",
  },
  importmap: {
    type: <const>"string",
    short: "i",
  },
};

export const PROCESS_CLI_ARGS_OPTIONS =
  isDebugging || isTesting
    ? Object.assign({}, PROCESS_DEFAULT_ARGS_OPTIONS, PROCESS_TESTING_CLI_ARGS_OPTIONS)
    : PROCESS_DEFAULT_ARGS_OPTIONS;
