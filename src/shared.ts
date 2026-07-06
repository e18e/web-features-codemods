export interface Options {
  source: string;
}

export interface Position {
  line: number;
  column: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface TestResult {
  hasMatch: boolean;
  range?: Range;
}

export interface CodeMod {
  apply(options: Options): string;
  test(options: Options): TestResult;
}
