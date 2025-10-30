module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true
  },
  extends: 'standard',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-expressions': 'off', // Disable unused expressions rule
    'no-sequences': 'off', // Disable sequence operator warnings
    'no-mixed-operators': 'off', // Disable mixed operators warnings
    'no-cond-assign': 'off', // Disable conditional assignment warnings
    'default-case': 'off', // Disable default case requirement
    'no-labels': 'off', // Disable label-related warnings
    'no-use-before-define': 'off', // Disable use-before-define warnings
    'no-unused-vars': 'warn', // Change unused variables to warnings
    'no-undef': 'warn', // Change undefined variables to warnings
    'no-func-assign': 'warn', // Change function assignment to warnings
    'no-useless-escape': 'off' // Disable useless escape warnings
  }
}
