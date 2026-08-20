import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'domain-common', pattern: 'src/domain/common/**', mode: 'full' },
        {
          type: 'domain-module',
          pattern: 'src/domain/!(common)/**',
          mode: 'full',
          capture: ['module'],
        },
        { type: 'infraestructure', pattern: 'src/infraestructure/**', mode: 'full' },
        { type: 'application', pattern: 'src/application/**', mode: 'full' },
        { type: 'configuration', pattern: 'src/configuration/**', mode: 'full' },
      ],
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: 'domain-module',
              disallow: ['infraestructure', 'application', 'configuration'],
            },
            {
              from: 'domain-common',
              disallow: ['infraestructure', 'application', 'configuration', 'domain-module'],
            },
          ],
        },
      ],
      'boundaries/no-unknown': 'off',
      'boundaries/no-unknown-files': 'off',
    },
  },
];
