import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import prettierConfig from 'eslint-config-prettier'; // This specifically turns off conflicting ESLint rules

export default tseslint.config(
  {
    ignores: ['postcss.config.js', 'tailwind.config.ts', 'node_modules', 'dist', '.next'],
  },
  // Standard ESLint recommended rules
  pluginJs.configs.recommended,

  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,

  // Configuration for all JavaScript/TypeScript files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      '@typescript-eslint': tseslint.plugin,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json', // Crucial for TypeScript-aware rules
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // Add any other specific global variables if needed (e.g., process, __dirname)
      },
    },
    rules: {
      // --- General ESLint Rules ---
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      quotes: ['error', 'double'],
      semi: ['error', 'always'],
      indent: ['error', 2, { SwitchCase: 1 }],
      'comma-dangle': ['error', 'always-multiline'],
      'prefer-const': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'object-shorthand': ['error', 'always'],
      'no-unneeded-ternary': 'error',
      'prefer-template': 'error',
      'no-trailing-spaces': 'error',
      'no-multi-spaces': 'error',

      // --- React Specific Rules ---
      'react/react-in-jsx-scope': 'off', // Not needed with Next.js 13+
      'react/prop-types': 'off', // Not needed with TypeScript
      'react/display-name': 'off',
      'react/self-closing-comp': ['error', { component: true, html: true }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/jsx-boolean-value': ['error', 'never'],

      // --- TypeScript Specific Rules ---
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^', varsIgnorePattern: '^' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      // The corrected member-ordering rule:
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: ['signature', 'field', 'constructor', 'method'],
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
      ],

      // --- Next.js specific rules (from @next/eslint-plugin-next) ---
      '@next/next/no-img-element': 'warn',
      // Add more Next.js rules if needed, e.g., "@next/next/no-html-link-for-pages": "error"
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
      // Add Next.js settings if needed
      // "next": {
      //   "rootDir": true // For Next.js config
      // }
    },
  },
  // IMPORTANT: Prettier config must come last to override conflicting rules
  prettierConfig
);
