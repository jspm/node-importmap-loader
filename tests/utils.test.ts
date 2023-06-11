import { vi, test, expect } from 'vitest'
import { ImportMap } from '@jspm/import-map';

import {
  constructPath,
  constructUrlPath,
  constructImportMap,
  createCacheMap,
} from '../src/utils';

import {
  ALL_CACHE_MAP_REQUIREMENTS_MUST_BE_DEFINED,
  NO_CACHE_MAP_DEFINED,
  PROCESS_CLI_ARGS_OPTIONS
} from "../src/constants";

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
  const path = `${process.cwd()}/tests/__fixtures__/fake.json`
  constructImportMap(path)
  expect(ImportMap).toHaveBeenCalled()
})

test('constructImportMap should use cwd if no path provided', () => {
  constructImportMap()
  expect(ImportMap).toHaveBeenCalledWith({
    rootUrl: process.cwd(),
    map: {
      "name": "is fake json"
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

// test('createCacheMap.get should return undefined if cachePath is not defined', () => {
//   const cacheMap = createCacheMap()
//   expect(cacheMap.get('foo')).toBeUndefined()
// })

test('createCacheMap.set should set cachePath and modulePath', () => {
  const cacheMap = createCacheMap()
  cacheMap.set('foo', 'bar')
  expect(cacheMap.cachePath).toBe('foo')
  expect(cacheMap.modulePath).toBe('bar')
})

test('createCacheMap.set should log error if cachePath or modulePath are undefined', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const cacheMap = createCacheMap(true)
  cacheMap.set(undefined as unknown as string, 'bar')
  expect(spy).toHaveBeenCalledWith(ALL_CACHE_MAP_REQUIREMENTS_MUST_BE_DEFINED)
})
