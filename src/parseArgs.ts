import { Options, ParsedArgs } from "./types";

export const parseArgs = ({ args, options }: Options) =>
  args.reduce((acc: ParsedArgs = {}, arg: string, index: number) => {
    const property = Object.keys(options).find((option) => option === arg || options[option]?.alias === arg);
    if (!property) return acc;
    const propertyOptions = options[property];
    const defaultBooleanValue = propertyOptions?.type === "boolean" ? true : false;
    const defaultValue = propertyOptions?.default || defaultBooleanValue;
    const initialValue = args[index + 1];
    const value = initialValue ? initialValue : defaultValue;
    return {
      ...acc,
      [property]: value,
    };
  }, {});
