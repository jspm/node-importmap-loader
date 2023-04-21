import { vi, test, expect } from 'vitest'
import { ImportMap } from "@jspm/import-map";

import {
  constructPath,
  constructLoaderConfig,
  constructImportMap,
  constructCachePath,
} from "../src/loader"

vi.mock('url', () => ({
  ...vi.importActual('url'),
  fileURLToPath: (str: string) => `./${str}`,
}));

vi.mock('@jspm/import-map', () => {
  const ImportMap = vi.fn()
  return { ImportMap }
})

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

test('constructImportMap', () => {
  const path = `${process.cwd()}/tests/__fixtures__/fake.json`
  constructImportMap(path, 'file://bin')
  expect(ImportMap).toBeCalledWith({
    rootUrl: "file://bin",
    map: {
      name: "is fake json"
    },
  })
})

test('constructCachePath', () => {
  const result = constructCachePath({
    cache: './bin',
    modulePath: 'https://ga.jspm.io/npm:morgan@1.10.0/index.js',
    debug: true,
  });
  console.log(result)
  expect(result).toStrictEqual('')

});
