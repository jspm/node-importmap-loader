import { resolve as resolveTs } from 'ts-node/esm';
import { URL, pathToFileURL } from 'url';

// Mock modules
const mockLogger = {
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {}
};

const mockConfig = {
  cacheDir: '/cache/path',
  getCachePath: (url) => `/cache/path/${url.split('/').pop()}`
};

const mockParseArgs = {
  cacheDir: '/cache/path'
};

const mockModules = new Map([
  ['./logger.js', mockLogger],
  ['./config.js', mockConfig],
  ['./parseArgs.js', mockParseArgs]
]);

export async function resolve(specifier, context, nextResolve) {
  if (mockModules.has(specifier)) {
    return {
      url: pathToFileURL(specifier).href,
      shortCircuit: true
    };
  }
  return resolveTs(specifier, context, nextResolve);
}

export async function load(url, context, nextLoad) {
  const specifier = new URL(url).pathname;
  const mockModule = mockModules.get(specifier);
  if (mockModule) {
    return {
      format: 'module',
      shortCircuit: true,
      source: `export default ${JSON.stringify(mockModule)};`
    };
  }
  return nextLoad(url, context);
} 