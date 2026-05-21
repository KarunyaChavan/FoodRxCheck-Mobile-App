const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  {
    ignores: ['.expo/', 'coverage/', 'dist/', 'node_modules/', 'web-build/', 'expo-env.d.ts'],
  },
  expoConfig,
  {
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'object-shorthand': ['error', 'always'],
      'no-implicit-coercion': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-alert': 'error',
    },
  },
]);
