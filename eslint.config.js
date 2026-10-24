import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import pluginReact from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'task']),
  {
    files: ['**/*.{js,ts,tsx}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.browser },
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'default-case': 'warn',
      'no-console': 'warn',
      'no-alert': 'warn',
      'prefer-arrow-callback': 'warn',
      'no-var': 'warn',
      'no-duplicate-case': 'warn',
      'no-extra-boolean-cast': 'warn',
      'object-shorthand': 'warn',
      'prefer-const': 'warn',
      eqeqeq: 'warn',
      curly: 'warn',
      'no-else-return': 'warn',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      pluginReact.configs.flat.recommended,
      pluginReact.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/jsx-key': 'warn',
      // Props are typed with TypeScript
      'react/prop-types': 'off',
    },
  },
  prettierConfig,
])
