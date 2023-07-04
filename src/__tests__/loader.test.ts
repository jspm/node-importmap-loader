import { resolve } from "src/loader";
import { ResolveOptions } from "src/types";
import { ImportMap } from "@jspm/import-map";

jest.mock("node-fetch", () => jest.fn());
jest.mock("@jspm/import-map", () => ({
  ImportMap: jest.fn(() => ({
    resolve: jest.fn(),
  })),
}));

jest.mock("@jspm/generator", () => ({
  parseUrlPkg: jest.fn(),
}));

import * as utils from "src/utils";

jest.mock("src/utils");

test("resolve with no nodeImportMapPath", async () => {
  const constructPathSpy = jest.spyOn(utils, "constructPath");
  const debugSpy = jest.spyOn(console, "debug");
  const errorSpy = jest.spyOn(console, "error");
  const nextResolve = jest.fn();
  const context = { parentURL: "parentURL" };
  const specifier = "specifier";
  const options = { debug: true } as ResolveOptions;
  await resolve(specifier, context, nextResolve, options);
  expect(constructPathSpy).toHaveBeenCalled();
  expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining("resolve:nodeImportMapPath:"), expect.anything());
  expect(errorSpy).toHaveBeenCalledWith("resolve: Error: Failed in resolving import map path");
  expect(nextResolve).toHaveBeenCalled();
});

test("resolve with no cache path", async () => {
  const constructPathSpy = jest.spyOn(utils, "constructPath").mockReturnValue("tests/node.importmap");
  const debugSpy = jest.spyOn(console, "debug");
  const errorSpy = jest.spyOn(console, "error");
  const nextResolve = jest.fn();
  const context = { parentURL: undefined };
  const specifier = "specifier";
  const options = { debug: true } as ResolveOptions;
  await resolve(specifier, context, nextResolve, options);
  expect(constructPathSpy).toHaveBeenCalled();
  expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining("resolve:pathToCache:"), expect.anything());
  expect(errorSpy).toHaveBeenCalledWith("resolve: Error: Failed in resolving cache path");
});

test("resolve with no pathToCache", async () => {
  const constructPathSpy = jest.spyOn(utils, "constructPath").mockReturnValue("tests/node.importmap");
  const debugSpy = jest.spyOn(console, "debug");
  const errorSpy = jest.spyOn(console, "error");
  const nextResolve = jest.fn();
  const context = { parentURL: "parentURL" };
  const specifier = "specifier";
  const options = { debug: true } as ResolveOptions;
  await resolve(specifier, context, nextResolve, options);
  expect(constructPathSpy).toHaveBeenCalled();
  expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining("resolve:importmap:"), expect.anything());
  expect(errorSpy).toHaveBeenCalledWith("resolve: Error: Failed in constructing import map");
});

test("resolve with no cacheMapPath", async () => {
  const constructPathSpy = jest.spyOn(utils, "constructPath").mockReturnValue("tests/node.importmap");
  const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
  const debugSpy = jest.spyOn(console, "debug");
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
  expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining("resolve:cacheMapPath:"), expect.anything());
  expect(errorSpy).toHaveBeenCalledWith("resolve: Error: Failed in resolving cache map path");
});

test("resolve with no modulePath", async () => {
  const constructPathSpy = jest.spyOn(utils, "constructPath").mockReturnValue("tests/node.importmap");
  const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
  // const debugSpy = jest.spyOn(console, 'debug');
  // const errorSpy = jest.spyOn(console, 'error');

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
});
