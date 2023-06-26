import { URL } from "node:url";

export type Context = {
  parentURL?: string;
}

export type ConstructCachePath = {
  cache: string;
  modulePath: string;
  debug?: boolean;
  matcher?: RegExp | string;
}

export type NextResolve = (specifier: string) => Promise<string | unknown>;

export type UrlType = URL

export type ResolveOptions = {
  basePath?: string;
  cachePath?: string;
  debug?: boolean;
  importmapPath?: string;
}
