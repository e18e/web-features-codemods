# @e18e/web-features-codemods

This project contains a collection of codemods for transforming code to make use of newer web features and syntax.

For example, converting from `array[array.length - 1]` to `array.at(-1)`.

## Installation

You can install the codemods using npm or yarn:

```bash
npm install @e18e/web-features-codemods --save-dev
```

## Available Codemods

| Codemod | Description | Example |
|---------|-------------|---------|
| `arrayAt` | Convert array length-based indexing to `at()` method | `array[array.length - 1]` → `array.at(-1)` |
| `arrayFill` | Optimize array fill patterns | Various fill pattern optimizations |
| `arrayIncludes` | Convert `indexOf` checks to `includes()` | `array.indexOf(item) !== -1` → `array.includes(item)` |
| `arrayToReversed` | Convert copy-and-reverse patterns to `toReversed()` | `array.slice().reverse()` → `array.toReversed()` |
| `arrayToSorted` | Convert copy-and-sort patterns to `toSorted()` | `array.slice().sort()` → `array.toSorted()` |
| `arrayToSpliced` | Convert copy-and-splice patterns to `toSpliced()` | `const copy = arr.slice(); copy.splice(0, 1);` → `const copy = arr.toSpliced(0, 1);` |
| `exponentiation` | Convert `Math.pow()` to exponentiation operator | `Math.pow(base, exp)` → `base ** exp` |
| `nullishCoalescing` | Convert null/undefined checks to nullish coalescing | `value != null ? value : default` → `value ?? default` |
| `objectHasOwn` | Convert `hasOwnProperty` to `Object.hasOwn()` | `obj.hasOwnProperty(prop)` → `Object.hasOwn(obj, prop)` |
| `postcssSignFunctions` | Remove imports for `postcss-sign-functions` polyfill | Removes obsolete polyfill imports |
| `spreadSyntax` | Convert array/object methods to spread syntax | `array.concat(other)` → `[...array, ...other]` |
| `stringIncludes` | Convert `indexOf` checks to `includes()` | `string.indexOf(substr) !== -1` → `string.includes(substr)` |
| `urlCanParse` | Convert URL validation try-catch to `URL.canParse()` | `try { new URL(url) } catch { }` → `URL.canParse(url)` |

## Usage

Each codemod can be imported and used programmatically. All codemods implement the same interface with `test()` and `apply()` methods.

### Basic Example

```javascript
import {arrayAt} from '@e18e/web-features-codemods';

const sourceCode = `
const lastItem = myArray[myArray.length - 1];
const firstItem = myArray[0];
`;

// Optionally check if the codemod applies to this source.
// You can also skip this step and directly call apply() as non-matching
// codemods will simply return the original source.
if (arrayAt.test({source: sourceCode})) {
  // Apply the transformation
  const transformed = arrayAt.apply({source: sourceCode});
  console.log(transformed);
  // Output:
  // const lastItem = myArray.at(-1);
  // const firstItem = myArray[0];
}
```

## License

MIT
