export type Context = {
  parentURL?: string;
};

export type NextResolve = (specifier: string) => Promise<string | unknown>;

export type LoggerOptions = {
  file: string;
  isLogging?: boolean;
};

export type OptionDefinition = {
  type?: string;
  alias?: string;
  default?: unknown;
};

export type Options = {
  args: string[];
  options: Record<string, OptionDefinition>;
};

export type ParsedArgs = {
  [x: string]: string | boolean | OptionDefinition;
};
