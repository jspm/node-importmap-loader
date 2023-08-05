import { resolve } from "src/loader";
import { parseUrlPkg } from "@jspm/generator";
import { ImportMap } from "@jspm/import-map";
import * as utils from "src/utils";
import * as config from "src/config";


jest.mock("node-fetch", () => jest.fn());

jest.mock("@jspm/generator", () => ({
  parseUrlPkg: jest.fn(),
}));

let mockImportMapResolve = jest.fn();
jest.mock("@jspm/import-map", () => ({
  ImportMap: jest.fn(() => ({
    resolve: mockImportMapResolve,
  })),
}));

jest.mock("src/utils", () => {
  const actual = jest.requireActual("src/utils");
  return {
    __esModule: true,
    ...actual,
  };
});

jest.mock("src/config", () => {
  const actual = jest.requireActual("src/config");
  return {
    __esModule: true,
    ...actual,
    cache: '',
  }
});

const errorSpy = jest.spyOn(console, "error");
const nextResolve = jest.fn();
const specifier = "specifier";
describe('loader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  })

  test("resolved with no cache path error", async () => {
    const context = { parentURL: undefined };
    await resolve(specifier, context, nextResolve);
    expect(errorSpy).toHaveBeenCalledWith("jspm:[loader]: resolve: Error: Failed in resolving cache path");
  });

  test("resolved with no modulePath error", async () => {
    const cachePath = 'test/.cache';
    (jest.mocked(config).cache as string) = cachePath
    mockImportMapResolve = jest.fn().mockReturnValue(undefined);
    const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
    const context = { parentURL: "parentURL" };
    await resolve(specifier, context, nextResolve);
    expect(constructImportMapSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith("jspm:[loader]: resolve: Error: Failed in resolving module path");
  });

  test("resolved with URL error", async () => {
    const cachePath = 'test/.cache';
    (jest.mocked(config).cache as string) = cachePath
    mockImportMapResolve = jest.fn().mockReturnValue("./some/path");
    const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
    const context = { parentURL: "parentURL" };
    await resolve(specifier, context, nextResolve);
    expect(constructImportMapSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith("jspm:[loader]: resolve: TypeError [ERR_INVALID_URL]: Invalid URL");
  });

  test("resolved with `isNode` protocol error", async () => {
    const cachePath = 'test/.cache';
    (jest.mocked(config).cache as string) = cachePath
    mockImportMapResolve = jest.fn().mockReturnValue("node:/some/path");
    const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
    const context = { parentURL: "parentURL" };
    await resolve(specifier, context, nextResolve);
    expect(constructImportMapSpy).toHaveBeenCalled();
    expect(nextResolve).toHaveBeenCalledWith('specifier');
  });

  test("resolved with `isFile` protocol error", async () => {
    const cachePath = 'test/.cache';
    (jest.mocked(config).cache as string) = cachePath
    mockImportMapResolve = jest.fn().mockReturnValue("node:/some/path");
    const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
    const context = { parentURL: "parentURL" };
    await resolve(specifier, context, nextResolve);
    expect(constructImportMapSpy).toHaveBeenCalled();
    expect(nextResolve).toHaveBeenCalledWith('specifier');
  });

  test("resolved with parseUrlPkg error", async () => {
    const cachePath = 'test/.cache';
    (jest.mocked(config).cache as string) = cachePath
    mockImportMapResolve = jest.fn().mockReturnValue("https://ga.jspm.io/some/path");
    const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
    const nextResolve = jest.fn();
    const context = { parentURL: "parentURL" };
    const specifier = "specifier";
    await resolve(specifier, context, nextResolve);
    expect(constructImportMapSpy).toHaveBeenCalled();
    expect(nextResolve).toHaveBeenCalledWith('specifier');
  });

  test("resolved with parsing node module cache path error", async () => {
    const cachePath = 'test/.cache';
    (jest.mocked(config).cache as string) = cachePath
    mockImportMapResolve = jest.fn().mockReturnValue("https://ga.jspm.io/some/path");
    await (parseUrlPkg as jest.Mock).mockResolvedValue({ pkg: { name: "name", version: "version" } });
    const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
    const context = { parentURL: "parentURL" };
    await resolve(specifier, context, nextResolve);
    expect(constructImportMapSpy).toHaveBeenCalled();
    expect(parseUrlPkg).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith("jspm:[loader]: resolve: Error: Failed in parsing node module cache path");
  });

  test("resolved without an error", async () => {
    const cachePath = 'test/.cache';
    (jest.mocked(config).cache as string) = cachePath
    mockImportMapResolve = jest.fn().mockReturnValue("https://ga.jspm.io/some/path");
    await (parseUrlPkg as jest.Mock).mockResolvedValue({ pkg: { name: "name", version: "version" } });
    const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
    const context = { parentURL: "parentURL" };
    const parseNodeModuleCachePathSpy = jest
      .spyOn(utils, "parseNodeModuleCachePath")
      .mockResolvedValue("node_modules/name/version");
    const nodeModuleCachePathSpy = jest.spyOn(utils, 'constructPath').mockReturnValue('node_modules/name/version')
    await resolve(specifier, context, nextResolve);
    expect(constructImportMapSpy).toHaveBeenCalled();
    expect(parseUrlPkg).toHaveBeenCalled();
    expect(parseNodeModuleCachePathSpy).toHaveBeenCalled();
    expect(nodeModuleCachePathSpy).toHaveBeenCalled();
    expect(nextResolve).toHaveBeenCalledWith("node_modules/name/version");
  });
});
