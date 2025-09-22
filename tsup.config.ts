import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    theme: 'src/theme.tsx',
    'medical/index': 'src/medical/index.ts',
    'model-config/index': 'src/model-config/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@rjsf/core',
    '@rjsf/utils',
    '@rjsf/validator-ajv8',
    'lucide-react',
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
  ],
  banner: {
    js: '"use client";',
  },
});