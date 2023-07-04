import { resolve } from "src/loader";
import { ResolveOptions } from "src/types";
import { parseUrlPkg } from "@jspm/generator";
import { ImportMap } from "@jspm/import-map";
import * as utils from "src/utils";

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

jest.mock("src/utils");

const constructPathSpy = jest.spyOn(utils, "constructPath");
const errorSpy = jest.spyOn(console, "error");
const nextResolve = jest.fn();
const specifier = "specifier";
const options = { debug: true } as ResolveOptions;
test("resolve with no nodeImportMapPath", async () => {
  const context = { parentURL: "parentURL" };
  await resolve(specifier, context, nextResolve, options);
  expect(constructPathSpy).toHaveBeenCalled();
  expect(errorSpy).toHaveBeenCalledWith("resolve: Error: Failed in resolving import map path");
  expect(nextResolve).toHaveBeenCalled();
});

test("resolve with no cache path", async () => {
  constructPathSpy.mockReturnValue("tests/node.importmap");
  const context = { parentURL: undefined };
  const options = { debug: true } as ResolveOptions;
  await resolve(specifier, context, nextResolve, options);
  expect(constructPathSpy).toHaveBeenCalled();
  expect(errorSpy).toHaveBeenCalledWith("resolve: Error: Failed in resolving cache path");
});

test("resolve with no pathToCache", async () => {
  constructPathSpy.mockReturnValue("tests/node.importmap");
  const context = { parentURL: "parentURL" };
  const options = { debug: true } as ResolveOptions;
  await resolve(specifier, context, nextResolve, options);
  expect(constructPathSpy).toHaveBeenCalled();
  expect(errorSpy).toHaveBeenCalledWith("resolve: Error: Failed in constructing import map");
});

test("resolve with no cacheMapPath", async () => {
  constructPathSpy.mockReturnValue("tests/node.importmap");
  const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
  const errorSpy = jest.spyOn(console, "error");

  const nextResolve = jest.fn();
  const context = { parentURL: "parentURL" };
  const specifier = "specifier";
  const cacheMap = {
    get: jest.fn().mockReturnValue(undefined),
  };
  const options = { debug: true, cacheMap } as unknown as ResolveOptions;
  await resolve(specifier, context, nextResolve, options);
  expect(constructPathSpy).toHaveBeenCalled();
  expect(constructImportMapSpy).toHaveBeenCalled();
  expect(errorSpy).toHaveBeenCalledWith("resolve: Error: Failed in resolving cache map path");
});

test("resolve with no modulePath", async () => {
  mockImportMapResolve = jest.fn().mockReturnValue(undefined);
  constructPathSpy.mockReturnValue("tests/node.importmap");

  const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
  const context = { parentURL: "parentURL" };
  const cacheMap = {
    get: jest.fn().mockReturnValue("tests/node.importmap"),
  };
  const options = { debug: true, cacheMap } as unknown as ResolveOptions;
  await resolve(specifier, context, nextResolve, options);
  expect(constructPathSpy).toHaveBeenCalled();
  expect(constructImportMapSpy).toHaveBeenCalled();
  expect(errorSpy).toHaveBeenCalledWith("resolve: Error: Failed in resolving module path");
});

test("resolve with URL error", async () => {
  mockImportMapResolve = jest.fn().mockReturnValue("./some/path");
  constructPathSpy.mockReturnValue("tests/node.importmap");

  const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
  const context = { parentURL: "parentURL" };
  const cacheMap = {
    get: jest.fn().mockReturnValue("tests/node.importmap"),
  };
  const options = { debug: true, cacheMap } as unknown as ResolveOptions;
  await resolve(specifier, context, nextResolve, options);
  expect(constructPathSpy).toHaveBeenCalled();
  expect(constructImportMapSpy).toHaveBeenCalled();
  expect(errorSpy).toHaveBeenCalledWith("resolve: TypeError [ERR_INVALID_URL]: Invalid URL");
});

test("resolve with `isNode` protocol error", async () => {
  mockImportMapResolve = jest.fn().mockReturnValue("node:/some/path");
  constructPathSpy.mockReturnValue("tests/node.importmap");
  const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
  const context = { parentURL: "parentURL" };
  const cacheMap = {
    get: jest.fn().mockReturnValue("tests/node.importmap"),
  };
  const options = { debug: true, cacheMap } as unknown as ResolveOptions;
  await resolve(specifier, context, nextResolve, options);
  expect(constructPathSpy).toHaveBeenCalled();
  expect(constructImportMapSpy).toHaveBeenCalled();
  expect(errorSpy).toHaveBeenCalledWith("resolve: Error: Failed in resolving URL");
});

test("resolve with `isFile` protocol error", async () => {
  mockImportMapResolve = jest.fn().mockReturnValue("node:/some/path");
  constructPathSpy.mockReturnValue("tests/node.importmap");
  const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
  const context = { parentURL: "parentURL" };
  const cacheMap = {
    get: jest.fn().mockReturnValue("tests/node.importmap"),
  };
  const options = { debug: true, cacheMap } as unknown as ResolveOptions;
  await resolve(specifier, context, nextResolve, options);
  expect(constructPathSpy).toHaveBeenCalled();
  expect(constructImportMapSpy).toHaveBeenCalled();
  expect(errorSpy).toHaveBeenCalledWith("resolve: Error: Failed in resolving URL");
});

test("resolve with parseUrlPkg error", async () => {
  mockImportMapResolve = jest.fn().mockReturnValue("https://ga.jspm.io/some/path");
  constructPathSpy.mockReturnValue("tests/node.importmap");
  const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
  const nextResolve = jest.fn();
  const context = { parentURL: "parentURL" };
  const specifier = "specifier";
  const cacheMap = {
    get: jest.fn().mockReturnValue("tests/node.importmap"),
  };
  const options = { debug: true, cacheMap } as unknown as ResolveOptions;
  await resolve(specifier, context, nextResolve, options);
  expect(constructPathSpy).toHaveBeenCalled();
  expect(constructImportMapSpy).toHaveBeenCalled();
  expect(errorSpy).toHaveBeenCalledWith("resolve: Error: Failed in parsing module meta data");
});

test(" resolve with parsing node module cache path", async () => {
  mockImportMapResolve = jest.fn().mockReturnValue("https://ga.jspm.io/some/path");
  await (parseUrlPkg as jest.Mock).mockResolvedValue({ pkg: { name: "name", version: "version" } });
  constructPathSpy.mockReturnValue("tests/node.importmap");

  const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
  const context = { parentURL: "parentURL" };
  const cacheMap = {
    get: jest.fn().mockReturnValue("tests/node.importmap"),
    set: jest.fn(),
  };
  const options = { debug: true, cacheMap } as unknown as ResolveOptions;
  await resolve(specifier, context, nextResolve, options);
  expect(constructPathSpy).toHaveBeenCalled();
  expect(constructImportMapSpy).toHaveBeenCalled();
  expect(parseUrlPkg).toHaveBeenCalled();
  expect(errorSpy).toHaveBeenCalledWith("resolve: Error: Failed in parsing node module cache path");
});
