import { URL } from "node:url";

export type Context = {
  parentURL?: string;
};

export type ConstructCachePath = {
  cache: string;
  modulePath: string;
  debug?: boolean;
  matcher?: RegExp | string;
};

export type NextResolve = (specifier: string) => Promise<string | unknown>;

export type UrlType = URL;

export type CreateCacheMapFactory = {
  cachePath?: string;
  instance: Map<string, string>;
  isDebugging?: boolean;
  modulePath?: string;
  get: (cachePath: string) => string | undefined;
  set: (cachePath: string, modulePath: string) => void;
};

export type ResolveOptions = {
  base?: string;
  cache?: string;
  debug?: boolean;
  importmap?: string;
  cacheMap?: CreateCacheMapFactory;
};

export type LoggerOptions = {
  file: string;
  isLogging?: boolean;
};
