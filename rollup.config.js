import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-cpy';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-re';
import resolve from 'rollup-plugin-node-resolve';
import strip from 'rollup-plugin-strip';
import visualizer from 'rollup-plugin-visualizer';
import {terser} from 'rollup-plugin-terser';

const sourceMap = true;

/** @type {Array<import('rollup').RollupOptions>} */
const config = [{
    input: 'preflight.js',
    output: {
      file: 'preflight.compact.js',
      format: 'cjs',
      sourcemap: sourceMap
    },
    external: require('module').builtinModules,
    plugins: [
      resolve(),
      commonjs({sourceMap}),
      json()
    ]
  },
  {
    input: './src/',
    output: [{
      exports: 'named',
      file: './dist/lib.js',
      format: 'cjs',
      sourcemap: sourceMap,
    },
      {
        exports: 'named',
        file: './dist/lib.min.js',
        format: 'iife',
        sourcemap: sourceMap,
        plugins: [terser()]
      }],
    external: require('module').builtinModules,
    plugins: [
      replace({
        patterns: [{
          test: /require\('debug'\)/gm,
          replace: '(() => () => {})'
        }]
      }),
      strip({functions: ['debug'], sourceMap}),
      resolve(),
      commonjs({sourceMap}),
      json(),
      copy({
        files: require.resolve('./xdg-open'),
        dest: __dirname,
        options: {verbose: true}
      }),
      visualizer()
    ]
  }];

export default config;
