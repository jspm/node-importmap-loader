export type Context = {
  parentURL?: string;
};

export type NextResolve = (specifier: string) => Promise<string | unknown>;

export type LoggerOptions = {
  file: string;
  isLogging?: boolean;
};

export interface OptionDefinition {
  type?: string;
  alias?: string;
  default?: any;
}

export interface Options {
  args: string[];
  options: Record<string, OptionDefinition>;
}
