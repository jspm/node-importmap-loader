import * as fs from 'node:fs';
import { ImportMap } from '@jspm/import-map';
import { vi, test, expect, describe, afterEach, Mock } from 'vitest'

import {
  constructPath,
  constructUrlPath,
  constructImportMap,
  createCacheMap,
  parseNodeModuleCachePath
} from '../src/utils';

import {
  ALL_CACHE_MAP_REQUIREMENTS_MUST_BE_DEFINED,
} from "../src/constants";

vi.mock('node-fetch', () => ({
  default: vi.fn().mockResolvedValue({
    ok: true,
    text: vi.fn().mockResolvedValue('module code')
  })
}))

vi.mock('@jspm/import-map', () => {
  const ImportMap = vi.fn()
  return { ImportMap }
})


test('constructPath minimal', () => {
  const result = constructPath('foo')
  expect(result).toStrictEqual('foo');
});

test('constructPath with root', () => {
  const result = constructPath('/foo', './bar')
  expect(result).toStrictEqual('bar/foo');
});

test('constructUrlPath minimal', () => {
  const result = constructUrlPath()
  expect(result).toStrictEqual('');
});

test('constructUrlPath with base url', () => {
  const result = constructUrlPath('bar.txt', 'file:///bin/foo/biz', true)
  expect(result).toStrictEqual('/bin/foo/bar.txt');
});

test('constructUrlPath with base url and no debug', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  constructUrlPath('bar.txt', 'bin/foo/biz', true)
  expect(spy).toHaveBeenCalled();
});

test('constructUrlPath with base url and no debug', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  constructUrlPath('bar.txt', 'bin/foo/biz', false)
  expect(spy).not.toHaveBeenCalled();
});

test('constructImportMap minimal', () => {
  const result = constructImportMap()
  expect(result).toStrictEqual(null);
});

test('constructImportMap should return null if path does not exist', () => {
  const result = constructImportMap('invalid/path')
  expect(result).toBeNull()
});

test('constructImportMap should return ImportMap instance if path exists', () => {
  const path = `${process.cwd()}/tests/__fixtures__/fake.json`;
  constructImportMap(path)
  expect(ImportMap).toHaveBeenCalled()
})

test('constructImportMap should use cwd if no path provided', () => {
  constructImportMap()
  expect(ImportMap).toHaveBeenCalledWith({
    rootUrl: process.cwd(),
    map: {
      // "name": "is fake json",
    }
  })
})

test('createCacheMap should return an object with instance, cachePath and modulePath properties', () => {
  const cacheMap = createCacheMap()
  expect(cacheMap).toHaveProperty('instance')
  expect(cacheMap).toHaveProperty('cachePath')
  expect(cacheMap).toHaveProperty('modulePath')
})

test('createCacheMap.get should return cachePath if defined', () => {
  const cacheMap = createCacheMap()
  cacheMap.set('foo', 'bar')
  expect(cacheMap.get('foo')).toBe('bar')
})

test('createCacheMap.get should return undefined if cachePath is not defined', () => {
  const cacheMap = createCacheMap()
  expect(cacheMap.get('foo')).toBeUndefined()
})

test('createCacheMap.set should set cachePath and modulePath', () => {
  const cacheMap = createCacheMap()
  cacheMap.set('foo', 'bar')
  expect(cacheMap.get('foo')).toBe('bar')
})

test('createCacheMap.set should log error if cachePath or modulePath are undefined', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const cacheMap = createCacheMap(true)
  cacheMap.set(undefined as unknown as string, 'bar')
  expect(spy).toHaveBeenCalledWith(ALL_CACHE_MAP_REQUIREMENTS_MUST_BE_DEFINED)
})

describe('parseNodeModuleCachePath', () => {
  const cachePath = '/path/to/cache';
  vi.mock("node:fs", async () => {
    return {
      ...(await vi.importActual<typeof import("node:fs")>("node:fs")),
      existsSync: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should return cachePath if it exists', async () => {
    (fs.existsSync as Mock).mockReturnValue(true)
    const result = await parseNodeModuleCachePath('modulePath', cachePath)
    expect(result).toBe(cachePath)
  })

  test('should make directories and write file if cachePath does not exist', async () => {
    (fs.existsSync as Mock).mockReturnValue(false)
    const mkdirSyncSpy = await vi.spyOn(fs, 'mkdirSync').mockReturnValue('');
    const writeFileSyncSpy = await vi.spyOn(fs, 'writeFileSync');
    await parseNodeModuleCachePath('modulePath', cachePath)
    expect(mkdirSyncSpy).toHaveBeenCalledWith('/path/to', { recursive: true })
    expect(writeFileSyncSpy).toHaveBeenCalledWith(cachePath, 'module code')
  })

  test('should return empty string if there is an error', async () => {
    (fs.existsSync as Mock).mockReturnValue(false)
    await vi.spyOn(fs, 'mkdirSync').mockReturnValue('');
    await vi.spyOn(fs, 'writeFileSync').mockImplementation(() => { throw new Error('error') });
    const errorSpy = await vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const result = await parseNodeModuleCachePath('modulePath', cachePath, true)
    expect(result).toBe('')
    expect(errorSpy).toHaveBeenCalled()
  })
});
