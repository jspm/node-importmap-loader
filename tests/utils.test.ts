import { vi, test, expect } from 'vitest'

import { constructPath, constructUrlPath, constructImportMap } from '../src/utils';

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

test('constructImportMap minimal', () => {
  const result = constructImportMap()
  expect(result).toStrictEqual(null);
});
