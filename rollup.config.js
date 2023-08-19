import typescript from '@rollup/plugin-typescript';
import html from '@rollup/plugin-html';
import postcss from 'rollup-plugin-postcss';

export default [
  {
    input: {
      index: 'src/index.ts',
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
  },
];
