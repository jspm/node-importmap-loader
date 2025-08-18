import { ESLint } from 'eslint';
import chalk from 'chalk';

console.log(chalk.blue.bold('\n🚀 ESLint via ImportMap Demo\n'));
console.log(chalk.gray('This demo shows ESLint running without being in node_modules!'));
console.log(chalk.gray('Instead, it\'s loaded directly from a CDN via importmap.\n'));

// Create sample code to lint
const codeToLint = `
const foo = 'bar'
const unused = 42;
function test() {
  console.log(foo)
  var oldStyle = true;
}
`;

// Initialize ESLint
const eslint = new ESLint({
  useEslintrc: false,
  overrideConfig: {
    env: {
      es2021: true,
      node: true
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-var': 'error',
      'prefer-const': 'warn',
      'semi': ['error', 'always']
    }
  }
});

// Lint the code
console.log(chalk.yellow('📝 Linting sample code...'));
console.log(chalk.gray('Code:'));
console.log(chalk.dim(codeToLint));

const results = await eslint.lintText(codeToLint);
const formatter = await eslint.loadFormatter('stylish');
const resultText = formatter.format(results);

if (resultText) {
  console.log(chalk.red('\n❌ Linting issues found:'));
  console.log(resultText);
} else {
  console.log(chalk.green('\n✅ No linting issues found!'));
}

// Show size comparison
console.log(chalk.cyan('\n📊 Size Comparison:'));
console.log(chalk.gray('Run these commands to compare:'));
console.log(chalk.white('  npm run size:traditional  # Shows size with ESLint as devDependency'));
console.log(chalk.white('  npm run size:importmap    # Shows size with importmap (no node_modules for ESLint)'));