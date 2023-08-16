import { parseNodeModuleCachePath } from '../parser';

import * as fs from "node:fs";

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

jest.mock("@jspm/import-map", () => ({
  ImportMap: jest.fn(() => ({
    resolve: jest.fn(),
  })),
}));

jest.mock('@jspm/generator', () => ({
  parseUrlPkg: jest.fn(),
}))

jest.mock("../utils", () => {
  const actual = jest.requireActual("../utils");
  return {
    __esModule: true,
    ...actual,
  };
});
import * as utils from "../utils";

jest.mock('../config')

describe("parseNodeModuleCachePath", () => {
  const cachePath = "file:///path/to/cache";
  jest.mock("node:fs", async () => {
    const actual = await jest.requireActual<typeof import("node:fs")>("node:fs");
    return {
      ...actual,
      existsSync: jest.fn(),
      writeFileSync: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return cachePath if it exists", async () => {
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    const result = await parseNodeModuleCachePath("modulePath", cachePath);
    expect(result).toBe(cachePath);
  });

  test("should make directories and write file if cachePath does not exist", async () => {
    jest.spyOn(fs, "existsSync").mockReturnValue(false);
    const ensureFileSyncSpy = jest.spyOn(utils, "ensureFileSync");
    await parseNodeModuleCachePath("modulePath", cachePath);
    expect(ensureFileSyncSpy).toBeCalled();
  });

  test("should return empty string if there is an error", async () => {
    jest.spyOn(fs, "existsSync").mockReturnValue(false);
    await jest.spyOn(fs, "writeFileSync").mockImplementation(() => {
      throw new Error("error");
    });
    const errorSpy = await jest.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await parseNodeModuleCachePath("modulePath", cachePath);
    expect(result).toBe("file:///path/to/cache");
    expect(errorSpy).toHaveBeenCalled();
  });
});
