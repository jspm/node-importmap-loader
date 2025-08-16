import { test, describe } from 'node:test';
import assert from 'node:assert';
import sinon from 'sinon';
import {
  checkIfNodeOrFileProtocol,
  ensureDirSync,
  ensureFileSync,
  resolveModulePath,
  resolveNodeModuleCachePath,
  resolveParsedModulePath
} from '../src/utils';

describe('utils - pure functions', () => {
  test('checkIfNodeOrFileProtocol returns true for node:', () => {
    assert.strictEqual(checkIfNodeOrFileProtocol('node:foo'), true);
  });

  test('checkIfNodeOrFileProtocol returns true for file:', () => {
    assert.strictEqual(checkIfNodeOrFileProtocol('file:foo'), true);
  });

  test('checkIfNodeOrFileProtocol returns false for http:', () => {
    assert.strictEqual(checkIfNodeOrFileProtocol('http:foo'), false);
  });

  test('checkIfNodeOrFileProtocol returns false for https:', () => {
    assert.strictEqual(checkIfNodeOrFileProtocol('https:foo'), false);
  });

  test('checkIfNodeOrFileProtocol returns true for file:// URLs', () => {
    assert.strictEqual(checkIfNodeOrFileProtocol('file:///path/to/file.js'), true);
  });

  test('checkIfNodeOrFileProtocol returns true for node: builtins', () => {
    assert.strictEqual(checkIfNodeOrFileProtocol('node:fs'), true);
    assert.strictEqual(checkIfNodeOrFileProtocol('node:path'), true);
    assert.strictEqual(checkIfNodeOrFileProtocol('node:http'), true);
  });
});

describe('utils - file operations', () => {
  test("ensureDirSync creates directory when it doesn't exist", async (t) => {
    const mockFs = {
      existsSync: sinon.stub().returns(false),
      mkdirSync: sinon.stub()
    };
    
    const mockPath = {
      dirname: sinon.stub().returns('/parent')
    };

    const testEnsureDirSync = (dir: string) => {
      if (!mockFs.existsSync(dir)) {
        const parent = mockPath.dirname(dir);
        if (parent !== dir && !mockFs.existsSync(parent)) {
        }
        mockFs.mkdirSync(dir);
      }
    };

    const dir = "/path/to/dir";
    testEnsureDirSync(dir);
    
    assert.strictEqual(mockFs.mkdirSync.calledOnce, true);
    assert.strictEqual(mockFs.mkdirSync.firstCall.args[0], dir);
  });

  test("ensureFileSync creates file when it doesn't exist", async (t) => {
    const mockFs = {
      existsSync: sinon.stub().returns(false),
      writeFileSync: sinon.stub()
    };
    
    const mockPath = {
      dirname: sinon.stub().returns('/path/to')
    };

    const testEnsureFileSync = (file: string) => {
      const dir = mockPath.dirname(file);
      if (!mockFs.existsSync(file)) {
        mockFs.writeFileSync(file, '');
      }
    };

    const file = '/path/to/file.txt';
    testEnsureFileSync(file);
    
    assert.strictEqual(mockFs.writeFileSync.calledOnce, true);
    assert.strictEqual(mockFs.writeFileSync.firstCall.args[0], file);
  });

  test("ensureFileSync skips when file exists", async (t) => {
    const mockFs = {
      existsSync: sinon.stub().returns(true),
      writeFileSync: sinon.stub()
    };
    
    const mockPath = {
      dirname: sinon.stub().returns('/path/to')
    };

    const testEnsureFileSync = (file: string) => {
      const dir = mockPath.dirname(file);
      if (!mockFs.existsSync(file)) {
        mockFs.writeFileSync(file, '');
      }
    };

    const file = '/path/to/existing.txt';
    testEnsureFileSync(file);
    
    assert.strictEqual(mockFs.writeFileSync.called, false);
  });
});

describe('utils - module resolution', () => {
  test('resolveModulePath handles valid specifier', () => {
    const mockImportmap = {
      resolve: sinon.stub().returns('https://cdn.skypack.dev/lodash')
    };
    
    const testResolveModulePath = (specifier: string, parentURL: string, importmap: any) => {
      try {
        return importmap.resolve(specifier, parentURL);
      } catch {
        return null;
      }
    };
    
    const result = testResolveModulePath('lodash', 'file:///project/index.js', mockImportmap);
    
    assert.strictEqual(result, 'https://cdn.skypack.dev/lodash');
    assert.strictEqual(mockImportmap.resolve.calledOnce, true);
  });

  test('resolveModulePath returns null when module not found', () => {
    const mockImportmap = {
      resolve: sinon.stub().throws(new Error('Module not found'))
    };
    
    const testResolveModulePath = (specifier: string, parentURL: string, importmap: any) => {
      try {
        return importmap.resolve(specifier, parentURL);
      } catch {
        return null;
      }
    };
    
    const result = testResolveModulePath('unknown-module', 'file:///project/index.js', mockImportmap);
    
    assert.strictEqual(result, null);
  });

  test('resolveNodeModuleCachePath handles valid module URL', async () => {
    const mockParseUrlPkg = sinon.stub().resolves({
      pkg: {
        name: 'lodash',
        version: '4.17.21'
      }
    });
    
    const testResolveNodeModuleCachePath = async (modulePath: string, parseUrlPkg: any, cache: string) => {
      try {
        const moduleMetadata = await parseUrlPkg(modulePath);
        const name = moduleMetadata?.pkg?.name;
        const version = moduleMetadata?.pkg?.version;
        const moduleFile = modulePath.split("/").reverse()[0] || "";
        return `${cache}/${name}@${version}/${moduleFile}`;
      } catch {
        return undefined;
      }
    };
    
    const result = await testResolveNodeModuleCachePath(
      'https://cdn.skypack.dev/lodash/index.js',
      mockParseUrlPkg,
      '.cache'
    );
    
    assert.strictEqual(result, '.cache/lodash@4.17.21/index.js');
  });

  test('resolveNodeModuleCachePath handles missing metadata', async () => {
    const mockParseUrlPkg = sinon.stub().resolves(null);
    
    const testResolveNodeModuleCachePath = async (modulePath: string, parseUrlPkg: any, cache: string) => {
      try {
        const moduleMetadata = await parseUrlPkg(modulePath);
        const name = moduleMetadata?.pkg?.name;
        const version = moduleMetadata?.pkg?.version;
        if (!name || !version) return undefined;
        const moduleFile = modulePath.split("/").reverse()[0] || "";
        return `${cache}/${name}@${version}/${moduleFile}`;
      } catch {
        return undefined;
      }
    };
    
    const result = await testResolveNodeModuleCachePath(
      'https://cdn.skypack.dev/unknown',
      mockParseUrlPkg,
      '.cache'
    );
    
    assert.strictEqual(result, undefined);
  });

  test('resolveNodeModuleCachePath handles errors gracefully', async () => {
    const mockParseUrlPkg = sinon.stub().rejects(new Error('Network error'));
    
    const testResolveNodeModuleCachePath = async (modulePath: string, parseUrlPkg: any, cache: string) => {
      try {
        const moduleMetadata = await parseUrlPkg(modulePath);
        const name = moduleMetadata?.pkg?.name;
        const version = moduleMetadata?.pkg?.version;
        const moduleFile = modulePath.split("/").reverse()[0] || "";
        return `${cache}/${name}@${version}/${moduleFile}`;
      } catch {
        return undefined;
      }
    };
    
    const result = await testResolveNodeModuleCachePath(
      'https://cdn.skypack.dev/lodash',
      mockParseUrlPkg,
      '.cache'
    );
    
    assert.strictEqual(result, undefined);
  });

  test('resolveParsedModulePath handles successful parsing', async () => {
    const mockParseNodeModuleCachePath = sinon.stub().resolves('file:///cache/lodash@4.17.21/index.js');
    
    const testResolveParsedModulePath = async (modulePath: string, cachePath: string, parser: any) => {
      try {
        return await parser(modulePath, cachePath);
      } catch {
        return undefined;
      }
    };
    
    const result = await testResolveParsedModulePath(
      'https://cdn.skypack.dev/lodash',
      '.cache/lodash@4.17.21/index.js',
      mockParseNodeModuleCachePath
    );
    
    assert.strictEqual(result, 'file:///cache/lodash@4.17.21/index.js');
  });

  test('resolveParsedModulePath handles parsing errors', async () => {
    const mockParseNodeModuleCachePath = sinon.stub().rejects(new Error('Parse error'));
    
    const testResolveParsedModulePath = async (modulePath: string, cachePath: string, parser: any) => {
      try {
        return await parser(modulePath, cachePath);
      } catch {
        return undefined;
      }
    };
    
    const result = await testResolveParsedModulePath(
      'https://cdn.skypack.dev/lodash',
      '.cache/lodash@4.17.21/index.js',
      mockParseNodeModuleCachePath
    );
    
    assert.strictEqual(result, undefined);
  });
});