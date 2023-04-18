import { vi, test, expect } from 'vitest'

import { constructPath, constructLoaderConfig } from "../src/loader"

vi.mock('url', () => ({
  ...vi.importActual('url'),
  fileURLToPath: (str: string) => `./${str}`,
}));

test('constructPath', () => {
  const result = constructPath('foo')
  expect(result).toStrictEqual('foo')
});

test('constructLoaderConfig', () => {
  const result = constructLoaderConfig('/', 'file://bin')
  expect(result).toStrictEqual({
    cache: "file:/bin/.cache",
    nodeImportMapPath: "file:/bin/node.importmap",
    root: "./file://bin/",
  })
});
