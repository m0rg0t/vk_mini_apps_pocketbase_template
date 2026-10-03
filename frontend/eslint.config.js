import js from '@eslint/js';
import parser from '@typescript-eslint/parser';
import ts from '@typescript-eslint/eslint-plugin';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';
export default [
  { ignores: ['build/**', 'dist/**', 'coverage/**', '.eslintrc.cjs'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } },
    plugins: { '@typescript-eslint': ts, 'react-hooks': hooks, 'react-refresh': refresh },
    rules: {
      ...js.configs.recommended.rules,
      ...ts.configs['eslint-recommended'].overrides[0].rules,
      ...ts.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-undef': 'off',
    },
  },
];
