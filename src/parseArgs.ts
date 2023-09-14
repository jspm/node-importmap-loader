import { Options } from "./types";

export const parseArgs = ({ args, options }: Options) => args.reduce((parsedArgs: Record<string, string | boolean>, arg: string, index: number) => {
  const option = options[arg];
  if (!option) return parsedArgs;
  const value = args[index + 1];
  const updatedOption = option?.alias || option;
  return {
    ...parsedArgs,
    [updatedOption as unknown as string]: value ? value : option.default || false,
  }
}, {});
