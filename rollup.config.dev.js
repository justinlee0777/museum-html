import typescript from '@rollup/plugin-typescript';
import html from '@rollup/plugin-html';
import postcss from 'rollup-plugin-postcss';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image';

const dir = 'dev';

const htmlConfig = {
  input: {
    'html/index': 'e2e/index.ts',
  },
  output: {
    sourcemap: true,
    dir,
  },
  plugins: [
    nodeResolve({
      moduleDirectories: ['node_modules'],
    }),
    typescript({
      tsconfig: 'tsconfig.dev.json',
    }),
    image(),
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

export default [htmlConfig];
