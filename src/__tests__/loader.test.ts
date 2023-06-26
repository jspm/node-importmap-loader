import { resolve } from "src/loader"

jest.mock('@jspm/generator', () => ({
  parseUrlPkg: jest.fn(),
}));

jest.mock('src/utils', () => ({
  constructPath: jest.fn(),
  constructImportMap: jest.fn(),
  constructUrlPath: jest.fn(),
  createCacheMap: jest.fn(),
  parseNodeModuleCachePath: jest.fn(),
  processCliArgs: jest.fn(),
}));

import * as utils from '../utils';

test('resolve success', async () => {
  jest.spyOn(utils, 'processCliArgs').mockReturnValue({
    values: { basePath: 'basePath', cachePath: 'cachePath', debug: true, importmapPath: 'importmapPath' },
    positionals: []
  })
  const constructUrlPathSpy = jest.spyOn(utils, 'constructUrlPath');
  const nextResolve = jest.fn();
  const context = { parentURL: 'parentURL' };
  const specifier = 'specifier';
  const debug = true;

  await resolve(specifier, context, nextResolve, debug);
  expect(constructUrlPathSpy).toHaveBeenCalled();
  expect(constructUrlPathSpy);
});
