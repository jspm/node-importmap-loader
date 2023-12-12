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

jest.mock("@jspm/import-map", () => ({
  ImportMap: jest.fn(() => ({
    resolve: jest.fn(),
  })),
}));

jest.mock('@jspm/generator', () => ({
  parseUrlPkg: jest.fn(),
}))

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
});
