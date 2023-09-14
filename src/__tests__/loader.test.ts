jest.mock("@jspm/import-map", () => ({
  ImportMap: jest.fn(() => ({
    resolve: jest.fn(),
  })),
}));

jest.mock("../utils", () => {
  const actual = jest.requireActual("../utils");
  return {
    __esModule: true,
    ...actual,
    ensureDirSync: jest.fn(),
  };
});
import * as utils from "../utils";

jest.mock("../parser");

jest.mock("../config", () => {
  const actual = jest.requireActual("../config");
  return {
    __esModule: true,
    ...actual,
    cache: '',
  }
});

import { resolve } from "../loader";

const nextResolve = jest.fn();
const specifier = "specifier";
describe('loader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  })

  test("resolved with basic config", async () => {
    const resolveModulePathSpy = jest.spyOn(utils, 'resolveModulePath').mockReturnValue('modulePath');
    const checkIfNodeOrFileProtocolSpy = jest.spyOn(utils, 'checkIfNodeOrFileProtocol').mockReturnValue(true);
    const context = { parentURL: "parentURL" };
    await resolve(specifier, context, nextResolve);
    expect(resolveModulePathSpy).toHaveBeenCalledWith(specifier, context.parentURL);
    expect(checkIfNodeOrFileProtocolSpy).toHaveBeenCalled();
    expect(nextResolve).toHaveBeenCalledWith('specifier');
  });
});
