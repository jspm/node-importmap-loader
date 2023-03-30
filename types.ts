export type Context = {
  parentURL?: string;
}

export type NextResolve = (specifier: string) => Promise<string | unknown>;
