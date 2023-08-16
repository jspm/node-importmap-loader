import * as fs from "node:fs";
import { ImportMap } from "@jspm/import-map";
import { constructImportMap } from "src/utils";

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
    rootUrl: `file://${process.cwd()}/src/utils.ts`,
    map: {},
  });
});
