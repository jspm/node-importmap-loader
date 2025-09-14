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
  getCachePath: (url: string) => `/cache/path/${url.split('/').pop()}`
};

const mockParseArgs = {
  cacheDir: '/cache/path'
};

type MockModule = typeof mockLogger | typeof mockConfig | typeof mockParseArgs;
const mockModules = new Map<string, MockModule>([
  ['./logger.js', mockLogger],
  ['./config.js', mockConfig],
  ['./parseArgs.js', mockParseArgs]
]);

export async function resolve(specifier: string, context: any, nextResolve: any) {
  if (mockModules.has(specifier)) {
    return {
      url: pathToFileURL(specifier).href,
      shortCircuit: true
    };
  }
  return resolveTs(specifier, context, nextResolve);
}

export async function load(url: string, context: any, nextLoad: any) {
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