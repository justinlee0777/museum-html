import typescript from '@rollup/plugin-typescript';
import html from '@rollup/plugin-html';
import postcss from 'rollup-plugin-postcss';

const htmlConfig = {
  input: {
    'html/index': 'e2e-tests/html/index.ts',
  },
  output: {
    sourcemap: true,
    dir: 'dist',
  },
  plugins: [
    typescript(),
    postcss({
      modules: {
        generateScopedName: 'room__[local]',
      },
    }),
    html({
      fileName: 'index.html',
    }),
  ],
};

const textConfig = {
  input: {
    'text/index': 'e2e-tests/text/index.ts',
  },
  output: {
    sourcemap: true,
    dir: 'dist',
  },
  plugins: [typescript()],
};

export default [htmlConfig, textConfig];
