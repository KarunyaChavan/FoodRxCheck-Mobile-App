module.exports = {
  root: true,
  extends: ['expo', 'plugin:eslint-comments/recommended'],
  plugins: ['jsdoc'],
  env: {
    es2022: true,
    jest: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    },
  },
  ignorePatterns: ['.expo/', 'coverage/', 'dist/', 'node_modules/', 'web-build/', 'expo-env.d.ts'],
  rules: {
    'eslint-comments/no-unused-disable': 'warn',
    'import/order': [
      'warn',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'object',
          'type',
        ],
        'newlines-between': 'always',
      },
    ],
    'no-unused-vars': 'off',
    'no-irregular-whitespace': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      files: ['src/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'jsdoc/check-param-names': 'warn',
        'jsdoc/check-tag-names': 'warn',
        'jsdoc/check-types': 'off',
        'jsdoc/require-file-overview': [
          'error',
          {
            tags: {
              fileoverview: {
                initialCommentsOnly: true,
                mustExist: true,
                preventDuplicates: true,
              },
            },
          },
        ],
        'jsdoc/require-jsdoc': [
          'warn',
          {
            publicOnly: true,
            require: {
              ArrowFunctionExpression: false,
              ClassDeclaration: true,
              FunctionDeclaration: true,
              FunctionExpression: false,
              MethodDefinition: false,
            },
          },
        ],
      },
    },
  ],
};
