import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'types/database.ts',
      'supabase/.temp/**',
      'reference/**',
      'design-system/**',
    ],
  },
  {
    rules: {
      'max-lines': ['warn', { max: 400, skipBlankLines: true, skipComments: true }],
    },
  },
];

export default eslintConfig;
