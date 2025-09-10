import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseNodeModuleCachePath } from './cache-path.js';
import { setupMocks, restoreMocks, createMockResponse, MockResponse, mockLogger } from './__tests__/test-utils.js';

// Mock config
const mockConfig = {
  cacheDir: '/cache/path',
  getCachePath: (url: string) => `/cache/path/${url.split('/').pop()}`
};

// Mock parseArgs
const mockParseArgs = {
  cacheDir: '/cache/path'
};

describe('cache-path', () => {
  describe('parseNodeModuleCachePath', () => {
    let mockExistsSync: (path: string) => boolean;
    let mockWriteFileSync: (path: string, content: string) => void;
    let mockMkdirSync: (path: string, options?: any) => void;
    let mockFetch: (url: string) => Promise<MockResponse>;

    beforeEach(() => {
      // Reset mock state
      mockExistsSync = () => false;
      mockWriteFileSync = () => {};
      mockMkdirSync = () => {};
      mockFetch = async () => createMockResponse();

      // Setup mocks
      setupMocks({
        existsSync: (path: string) => mockExistsSync(path),
        writeFileSync: (path: string, content: string) => mockWriteFileSync(path, content),
        mkdirSync: (path: string, options?: any) => mockMkdirSync(path, options),
        fetch: (url: string) => mockFetch(url),
      });

      // Override require to return our mocks
      (global as any).require = (module: string) => {
        if (module === './logger.js') {
          return mockLogger;
        }
        if (module === './config.js') {
          return mockConfig;
        }
        if (module === './parseArgs.js') {
          return mockParseArgs;
        }
        return (global as any).originalRequire(module);
      };
    });

    afterEach(() => {
      restoreMocks();
    });

    it('returns cache path directly if it exists', async () => {
      mockExistsSync = () => true;
      const result = await parseNodeModuleCachePath('http://example.com/module.js', '/cache/path/module.js');
      assert.equal(result, '/cache/path/module.js');
    });

    it('downloads and writes to cache if cache path does not exist', async () => {
      let writtenPath = '';
      let writtenContent = '';
      mockWriteFileSync = (path: string, content: string) => {
        writtenPath = path;
        writtenContent = content;
      };

      const result = await parseNodeModuleCachePath('http://example.com/module.js', '/cache/path/module.js');
      
      assert.equal(result, '/cache/path/module.js');
      assert.equal(writtenPath, '/cache/path/module.js');
      assert.equal(writtenContent, 'const example = true;');
    });

    it('handles failed fetch requests', async () => {
      let writeFileCalled = false;
      mockWriteFileSync = () => {
        writeFileCalled = true;
      };
      mockFetch = async () => createMockResponse({ ok: false, status: 404, statusText: 'Not Found' });

      const result = await parseNodeModuleCachePath('http://example.com/module.js', '/cache/path/module.js');
      
      assert.equal(result, '/cache/path/module.js');
      assert.equal(writeFileCalled, false);
    });
  });
}); 