import prettier from 'prettier';
import chalk from 'chalk';
import { readFileSync, writeFileSync } from 'fs';

console.log(chalk.magenta.bold('\n✨ Prettier via ImportMap Demo\n'));
console.log(chalk.gray('This demo shows Prettier running without being in node_modules!'));
console.log(chalk.gray('Instead, it\'s loaded directly from a CDN via importmap.\n'));

// Sample unformatted code
const unformattedCode = `
const   ugly  =    {
      foo:'bar',
    baz:    42,
  qux:   true
}

function  messyFunction(   a,b,   c )  {
const result=a+b   +c;
      return   result
}

const  array=[1,  2,3,   4,5   ];
const longString="This is a really really really really really really really really really long string that should be wrapped";
`;

console.log(chalk.yellow('📝 Original code (unformatted):'));
console.log(chalk.dim(unformattedCode));

// Format the code using Prettier
const formatted = await prettier.format(unformattedCode, {
  parser: 'babel',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  printWidth: 80,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always'
});

console.log(chalk.green('\n✨ Formatted code:'));
console.log(chalk.white(formatted));

// Save sample files for demonstration
writeFileSync('sample.js', unformattedCode);
console.log(chalk.cyan('\n💾 Created sample.js with unformatted code'));

writeFileSync('sample.formatted.js', formatted);
console.log(chalk.cyan('💾 Created sample.formatted.js with formatted code'));

// Check if code needed formatting
const isFormatted = unformattedCode === formatted;
if (!isFormatted) {
  console.log(chalk.green('\n✅ Code was successfully formatted!'));
} else {
  console.log(chalk.yellow('\n⚠️  Code was already formatted'));
}

// Show size comparison
console.log(chalk.cyan('\n📊 Size Comparison:'));
console.log(chalk.gray('Run these commands to compare:'));
console.log(chalk.white('  npm run size:traditional  # Shows size with Prettier as devDependency'));
console.log(chalk.white('  npm run size:importmap    # Shows size with importmap (no node_modules for Prettier)'));

// Show feature benefits
console.log(chalk.blue('\n🎯 Benefits of ImportMap approach:'));
console.log(chalk.white('  • No local Prettier installation needed'));
console.log(chalk.white('  • Instant access to latest Prettier version'));
console.log(chalk.white('  • Significantly smaller project size'));
console.log(chalk.white('  • Faster CI/CD pipelines (no npm install for tools)'));