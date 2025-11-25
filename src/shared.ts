export interface Options {
  source: string;
}

export interface CodeMod {
  apply(options: Options): string;
  test(options: Options): boolean;
}
