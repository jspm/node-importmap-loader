import * as fs from "node:fs";
import * as utils from 'src/utils';
import { parseNodeModuleCachePath } from '../parser';

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

const mockImportMapResolve = jest.fn();

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

describe("parseNodeModuleCachePath", () => {
  const cachePath = "file:///path/to/cache";
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
    const ensureDirSyncSpy = jest.spyOn(utils, "ensureDirSync");
    const writeFileSyncSpy = jest.spyOn(fs, "writeFileSync");
    await parseNodeModuleCachePath("modulePath", cachePath);
    expect(ensureDirSyncSpy).toBeCalled();
    expect(writeFileSyncSpy).toBeCalledWith(cachePath, "module code");
  });

  test("should return empty string if there is an error", async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    await jest.spyOn(fs, "writeFileSync").mockImplementation(() => {
      throw new Error("error");
    });
    const errorSpy = await jest.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await parseNodeModuleCachePath("modulePath", cachePath);
    expect(result).toBe("file:///path/to/cache");
    expect(errorSpy).toHaveBeenCalled();
  });
});
