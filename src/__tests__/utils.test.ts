import {
  checkIfNodeOrFileProtocol,
  ensureDirSync,
  ensureFileSync,
  resolveModulePath,
  resolveNodeModuleCachePath,
  resolveParsedModulePath
} from '../utils';

jest.mock('node:fs');
jest.mock('node:path');
import * as fs from "node:fs";
import * as path from "node:path";

jest.mock("@jspm/import-map", () => ({
  ImportMap: jest.fn(() => ({
    resolve: jest.fn(),
  })),
}));

jest.mock('@jspm/generator', () => ({
  parseUrlPkg: jest.fn(),
}))

import * as generator from '@jspm/generator';

jest.mock('../config')
import * as config from '../config';

jest.mock('../parser', () => ({
  parseNodeModuleCachePath: jest.fn(),
}))
import * as parser from '../parser';

test("ensureDirSync has dir", () => {
  const dir = "/path/to/dir";
  const existsSyncMock = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
  const dirnameMock = jest.spyOn(path, 'dirname')
  ensureDirSync(dir);
  expect(existsSyncMock).toBeCalledWith(dir);
  expect(dirnameMock).not.toBeCalled();
});

test("ensureDirSync has parent dir", () => {
  const dir = "/path/to/dir";
  const existsSyncMock = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
  const dirnameMock = jest.spyOn(path, 'dirname').mockReturnValue("/path/to/dir");
  const mkdirSyncMock = jest.spyOn(fs, 'mkdirSync')
  ensureDirSync(dir);
  expect(existsSyncMock).toBeCalledWith(dir);
  expect(dirnameMock).toBeCalledWith(dir);
  expect(mkdirSyncMock).toHaveBeenCalledTimes(1);
});

test("ensureDirSync to have recursion", () => {
  const dir = "/path/to/dir";
  const existsSyncMock = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
  const dirnameMock = jest.spyOn(path, 'dirname').mockReturnValue("/path/");
  const mkdirSyncMock = jest.spyOn(fs, 'mkdirSync')
  ensureDirSync(dir);
  expect(existsSyncMock).toBeCalledWith(dir);
  expect(dirnameMock).toBeCalledWith(dir);
  expect(mkdirSyncMock).toHaveBeenCalledTimes(2);
});

test("ensureFileSync has file", () => {
  const dir = 'path/to/file';
  const dirnameMock = jest.spyOn(path, 'dirname').mockReturnValue("/path/to/dir");
  const existsSyncMock = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
  const writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync');
  ensureFileSync(dir);
  expect(dirnameMock).toBeCalled();
  expect(existsSyncMock).toBeCalled();
  expect(writeFileSyncSpy).toBeCalled();
});

test('checkIfNodeOrFileProtocol returns true', () => {
  const protocol = 'node:foo';
  expect(checkIfNodeOrFileProtocol(protocol)).toBeTruthy();
})

test('checkIfNodeOrFileProtocol returns false', () => {
  const protocol = 'http:foo';
  expect(checkIfNodeOrFileProtocol(protocol)).toBeFalsy();
})

test('resolveModulePath', () => {
  const specifier = 'foo';
  const cacheMapPath = 'file:///bar';
  const resolve = jest.fn().mockReturnValue('file:///bar/foo');
  (jest.mocked(config).importmap as unknown) = {
    resolve
  }
  const result = resolveModulePath(specifier, cacheMapPath);
  expect(result).toBe('file:///bar/foo');
})

test('resolveModulePath with modulePath', async () => {
  const parseUrlPkgSpy = await jest.spyOn(generator, 'parseUrlPkg').mockResolvedValue({
    pkg: {
      name: 'foo',
      version: '1.0.0',
    }
  } as ExactModule | Promise<ExactModule | null>);
  (jest.mocked(config).cache as unknown) = 'test/.cache'
  const modulePath = 'file:///bar/index.js';
  const joinSpy = jest.spyOn(path, 'join').mockReturnValue('test/.cache/foo@1.0.0/bar/index.js');
  const result = await resolveNodeModuleCachePath(modulePath);
  expect(parseUrlPkgSpy).toBeCalledWith(modulePath);
  expect(joinSpy).toBeCalled();
  expect(result).toBe('test/.cache/foo@1.0.0/bar/index.js');
});

test('resolveParsedModulePath', async () => {
  const parseNodeModuleCachePathSpy = await jest.spyOn(parser, 'parseNodeModuleCachePath').mockResolvedValue('file:///foo/bar');
  const result = await resolveParsedModulePath('file:///foo/bar', 'file:///foo/bar');
  expect(parseNodeModuleCachePathSpy).toBeCalled();
  expect(result).toBe('file:///foo/bar');
})
