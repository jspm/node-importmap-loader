import { resolve } from "src/loader"
import { ResolveOptions } from "src/types";

jest.mock('node-fetch', () => jest.fn());
jest.mock('@jspm/import-map', () => ({
  ImportMap: jest.fn()
}));

jest.mock('@jspm/generator', () => ({
  parseUrlPkg: jest.fn(),
}));

import * as utils from 'src/utils';

jest.mock('src/utils');

test('resolve success', async () => {
  const constructPathSpy = jest.spyOn(utils, 'constructPath');
  const nextResolve = jest.fn();
  const context = { parentURL: 'parentURL' };
  const specifier = 'specifier';
  const options = { debug: true } as ResolveOptions;
  await resolve(specifier, context, nextResolve, options);
  expect(constructPathSpy).toHaveBeenCalled();
});
