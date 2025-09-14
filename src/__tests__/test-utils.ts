import { existsSync, writeFileSync, mkdirSync } from 'node:fs';

// Mock logger
export const mockLogger = {
  debug: () => {},
  error: () => {},
};

// Store original functions
export const originalFunctions = {
  existsSync,
  writeFileSync,
  mkdirSync,
  fetch: global.fetch,
  require: require,
};

// Mock Response type
export interface MockResponse extends Response {
  ok: boolean;
  text: () => Promise<string>;
  headers: Headers;
  redirected: boolean;
  status: number;
  statusText: string;
  type: ResponseType;
  url: string;
  clone: () => Response;
  body: null;
  bodyUsed: boolean;
  bytes: () => Promise<Uint8Array>;
  arrayBuffer: () => Promise<ArrayBuffer>;
  blob: () => Promise<Blob>;
  formData: () => Promise<FormData>;
  json: () => Promise<any>;
}

// Create a mock Response
export function createMockResponse(options: Partial<MockResponse> = {}): MockResponse {
  return {
    ok: true,
    text: async () => 'const example = true;',
    headers: new Headers(),
    redirected: false,
    status: 200,
    statusText: 'OK',
    type: 'default' as ResponseType,
    url: '',
    clone: () => new Response(),
    body: null,
    bodyUsed: false,
    bytes: async () => new Uint8Array(),
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    json: async () => ({}),
    ...options,
  } as MockResponse;
}

// Setup mocks
export function setupMocks(options: {
  existsSync?: (path: string) => boolean;
  writeFileSync?: (path: string, content: string) => void;
  mkdirSync?: (path: string, options?: any) => void;
  fetch?: (url: string) => Promise<MockResponse>;
} = {}) {
  // Override global functions
  Object.defineProperty(global, 'existsSync', {
    value: options.existsSync || (() => false),
    configurable: true
  });
  Object.defineProperty(global, 'writeFileSync', {
    value: options.writeFileSync || (() => {}),
    configurable: true
  });
  Object.defineProperty(global, 'mkdirSync', {
    value: options.mkdirSync || (() => {}),
    configurable: true
  });
  Object.defineProperty(global, 'fetch', {
    value: options.fetch || (async () => createMockResponse()),
    configurable: true
  });

  // Override module system
  (global as any).require = (module: string) => {
    if (module === './logger.js') {
      return { logger: () => mockLogger };
    }
    if (module === './config.js') {
      return { isDebuggingEnabled: false };
    }
    return originalFunctions.require(module);
  };
}

// Restore original functions
export function restoreMocks() {
  Object.defineProperty(global, 'existsSync', { value: originalFunctions.existsSync });
  Object.defineProperty(global, 'writeFileSync', { value: originalFunctions.writeFileSync });
  Object.defineProperty(global, 'mkdirSync', { value: originalFunctions.mkdirSync });
  Object.defineProperty(global, 'fetch', { value: originalFunctions.fetch });
  (global as any).require = originalFunctions.require;
} 