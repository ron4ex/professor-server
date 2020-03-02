import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import analyze from 'rollup-plugin-analyzer';
import pkg from './package.json';
import typescript from '@rollup/plugin-typescript';
import { eslint } from 'rollup-plugin-eslint';

const isProduction = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.ts',
  external: ['react', 'lodash-es'],
  output: {
    file: pkg.main,
    format: 'cjs',
    sourcemap: true,
    sourcemapExcludeSources: true,
  },
  plugins: [
    eslint(),
    resolve(),
    commonjs(),
    typescript(),
    !isProduction && analyze(),
  ],
};
