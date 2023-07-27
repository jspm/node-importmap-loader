import * as fs from "node:fs";
import * as path from "node:path";
import { ImportMap } from "@jspm/import-map";

import {
  constructPath,
  constructUrlPath,
  constructImportMap,
  createCacheMap,
  parseNodeModuleCachePath,
  processCliArgs,
} from "src/utils";

import { ALL_CACHE_MAP_REQUIREMENTS_MUST_BE_DEFINED } from "src/constants";

jest.mock("node:fs");

jest.mock("node:path", () => {
  const actual = jest.requireActual("node:path");
  return {
    ...actual,
    dirname: jest.fn((str) => str),
    join: jest.fn((str, str2) => `${str}${str2}`),
  };
});

jest.mock("node-fetch", () =>
  jest.fn().mockResolvedValue({
    ok: true,
    text: jest.fn().mockResolvedValue("module code"),
  })
);

jest.mock("@jspm/import-map", () => {
  const ImportMap = jest.fn();
  return { ImportMap };
});

test("constructPath minimal", () => {
  const result = constructPath("foo");
  expect(result).toStrictEqual("./foo");
});

test("constructPath with root", () => {
  const result = constructPath("/foo", "./bar");
  expect(result).toStrictEqual("./bar/foo");
});

test("constructUrlPath minimal", () => {
  const result = constructUrlPath();
  expect(result).toStrictEqual("");
});

test("constructUrlPath with base url", () => {
  const result = constructUrlPath("bar.txt", "file:///bin/foo/biz", true);
  expect(result).toStrictEqual("/bin/foo/bar.txt");
});

test("constructUrlPath with base url and no debug", () => {
  const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  constructUrlPath("bar.txt", "bin/foo/biz", true);
  expect(spy).toHaveBeenCalled();
});

test("constructImportMap minimal", () => {
  const result = constructImportMap();
  expect(result).toBeInstanceOf(ImportMap);
});

test("constructImportMap should return null if path does not exist", () => {
  jest.spyOn(fs, "readFileSync").mockReturnValue(Error("invalid/path") as unknown as string);
  const result = constructImportMap("invalid/path");
  expect(result).toEqual({});
});

test("constructImportMap should return ImportMap instance if path exists", () => {
  const path = `${process.cwd()}/src/__fixtures__/fake.json`;
  constructImportMap(path);
  expect(ImportMap).toHaveBeenCalled();
});

test("constructImportMap should use cwd if no path provided", () => {
  constructImportMap();
  expect(ImportMap).toHaveBeenCalledWith({
    rootUrl: process.cwd(),
    map: {},
  });
});

test("createCacheMap should return an object with instance, cachePath and modulePath properties", () => {
  const cacheMap = createCacheMap();
  expect(cacheMap).toHaveProperty("instance");
  expect(cacheMap).toHaveProperty("cachePath");
  expect(cacheMap).toHaveProperty("modulePath");
});

test("createCacheMap.get should return cachePath if defined", () => {
  const cacheMap = createCacheMap();
  cacheMap.set("foo", "bar");
  expect(cacheMap.get("foo")).toBe("bar");
});

test("createCacheMap.get should return undefined if cachePath is not defined", () => {
  const cacheMap = createCacheMap();
  expect(cacheMap.get("foo")).toBeUndefined();
});

test("createCacheMap.set should set cachePath and modulePath", () => {
  const cacheMap = createCacheMap();
  cacheMap.set("foo", "bar");
  expect(cacheMap.get("foo")).toBe("bar");
});

test("createCacheMap.set should log error if cachePath or modulePath are undefined", () => {
  const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  const cacheMap = createCacheMap(true);
  cacheMap.set(undefined as unknown as string, "bar");
  expect(spy).toHaveBeenCalledWith(`jspm:[utils]: ${ALL_CACHE_MAP_REQUIREMENTS_MUST_BE_DEFINED}`);
});

describe("parseNodeModuleCachePath", () => {
  const cachePath = "/path/to/cache";
  jest.mock("node:fs", async () => {
    const actual = await jest.requireActual<typeof import("node:fs")>("node:fs");
    return {
      ...actual,
      existsSync: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return cachePath if it exists", async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    const result = await parseNodeModuleCachePath("modulePath", cachePath);
    expect(result).toBe(cachePath);
  });

  test("should make directories and write file if cachePath does not exist", async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    const dirNameSpy = jest.spyOn(path, "dirname");
    const mkdirSyncSpy = jest.spyOn(fs, "mkdirSync").mockReturnValue("");
    const writeFileSyncSpy = jest.spyOn(fs, "writeFileSync");
    await parseNodeModuleCachePath("modulePath", cachePath);
    expect(dirNameSpy).toBeCalled();
    expect(mkdirSyncSpy).toBeCalledWith("/path/to/cache", { recursive: true });
    expect(writeFileSyncSpy).toBeCalledWith(cachePath, "module code");
  });

  test("should return empty string if there is an error", async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    await jest.spyOn(fs, "mkdirSync").mockReturnValue("");
    await jest.spyOn(fs, "writeFileSync").mockImplementation(() => {
      throw new Error("error");
    });
    const errorSpy = await jest.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await parseNodeModuleCachePath("modulePath", cachePath, true);
    expect(result).toBe("");
    expect(errorSpy).toHaveBeenCalled();
  });
});

test("processCliArgs should return an object with the parsed CLI arguments", () => {
  const args = ["src", "cache", "--debug"];
  const result = processCliArgs(args);
  expect(result).toEqual({
    positionals: ["src", "cache"],
    values: {
      debug: true,
    },
  });
});

test("processCliArgs should send empty defaults", () => {
  const result = processCliArgs([]);
  expect(result).toEqual({
    positionals: [],
    values: {},
  });
});

test("processCliArgs should allow boolean flags", () => {
  const args = ["--debug"];
  const result = processCliArgs(args);
  expect(result).toEqual({
    positionals: [],
    values: { debug: true },
  });
});

test("processCliArgs should allow positionals", () => {
  const args = ["src", "cache"];
  const result = processCliArgs(args);
  expect(result).toEqual({
    positionals: ["src", "cache"],
    values: {},
  });
});
