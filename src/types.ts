export type Context = {
  parentURL?: string;
};

export type NextResolve = (specifier: string) => Promise<string | unknown>;

export type LoggerOptions = {
  file: string;
  isLogging?: boolean;
};
