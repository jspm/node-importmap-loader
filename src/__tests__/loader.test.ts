import { resolve } from "src/loader";
import { parseUrlPkg } from "@jspm/generator";
import { ImportMap } from "@jspm/import-map";
import * as utils from "src/utils";
import * as config from "src/config";
import * as parser from "src/parser";


jest.mock("node-fetch", () =>
  jest.fn().mockResolvedValue({
    ok: true,
    text: jest.fn().mockResolvedValue("module code"),
  })
);

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

jest.mock("src/parser", () => {
  const actual = jest.requireActual("src/parser");
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
    expect(nextResolve).toHaveBeenCalledWith("test/.cache/name@version/path");
  });

  test("resolved without an error", async () => {
    const cachePath = 'test/.cache';
    (jest.mocked(config).cache as string) = cachePath
    mockImportMapResolve = jest.fn().mockReturnValue("https://ga.jspm.io/some/path");
    await (parseUrlPkg as jest.Mock).mockResolvedValue({ pkg: { name: "name", version: "version" } });
    const constructImportMapSpy = jest.spyOn(utils, "constructImportMap").mockReturnValue(new ImportMap({}));
    const context = { parentURL: "parentURL" };
    const parseNodeModuleCachePathSpy = jest
      .spyOn(parser, "parseNodeModuleCachePath")
      .mockResolvedValue("node_modules/name/version");
    await resolve(specifier, context, nextResolve);
    expect(constructImportMapSpy).toHaveBeenCalled();
    expect(parseUrlPkg).toHaveBeenCalled();
    expect(parseNodeModuleCachePathSpy).toHaveBeenCalled();
    expect(nextResolve).toHaveBeenCalledWith("node_modules/name/version");
  });
});
