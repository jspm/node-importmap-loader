import * as fs from "node:fs";
import * as path from "node:path";
import { ensureDirSync } from 'src/utils';

jest.mock("node:fs");
jest.mock("node:path");

test("ensureDirSync has dir", () => {
  const dir = "/path/to/dir";
  const existsSyncMock = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
  ensureDirSync(dir);
  expect(existsSyncMock).toBeCalledWith(dir);
  expect(fs.mkdirSync).not.toBeCalled();
});

test("ensureDirSync has no dir", () => {
  const dir = "/path/to/dir";
  const existsSyncMock = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
  const mkdirSyncMock = jest.spyOn(fs, 'mkdirSync')
  ensureDirSync(dir);
  expect(existsSyncMock).toBeCalledWith(dir);
  expect(mkdirSyncMock).toBeCalledWith(dir);
});
