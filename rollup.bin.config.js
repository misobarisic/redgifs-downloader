import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-cpy';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-re';
import resolve from 'rollup-plugin-node-resolve';
import strip from 'rollup-plugin-strip';
import visualizer from 'rollup-plugin-visualizer';

const sourceMap = true;

/** @type {Array<import('rollup').RollupOptions>} */
const config = [{
    input: 'cli.js',
    output: {
        file: './bin/redgifs-downloader',
        format: 'cjs',
        banner: '#!/usr/bin/env node',
    },
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
