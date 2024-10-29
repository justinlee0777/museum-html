import typescript from '@rollup/plugin-typescript';
import html from '@rollup/plugin-html';
import postcss from 'rollup-plugin-postcss';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image';

const dir = 'dist';

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
    typescript(),
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
