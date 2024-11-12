import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image';
import { copyFileSync, mkdirSync } from 'fs';

const dir = 'dist';

mkdirSync(dir);
copyFileSync('package.json', `${dir}/package.json`);
copyFileSync('LICENSE', `${dir}/LICENSE`);

const htmlConfig = {
  input: './index.ts',
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
      inject: (cssVariableName) =>
        `import styleInject from 'style-inject';\nstyleInject(${cssVariableName});`,
    }),
  ],
};

export default [htmlConfig];
