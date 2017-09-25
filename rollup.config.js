import multiEntry from 'rollup-plugin-multi-entry';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default [
  {
    plugins: [
      multiEntry(),
      commonjs(),
      nodeResolve()
    ],
    entry: './test/*.spec.js',
    dest: 'dist/test/index.js',
    format: 'cjs',
    external: [
      'chai',
      'mathjs'
    ]
  },
  {
    plugins: [
      commonjs(),
      nodeResolve()
    ],
    entry: './src/index.js',
    dest: 'dist/index.cjs.js',
    format: 'cjs',
    external: [ 'mathjs' ]
  },
  {
    plugins: [
      commonjs(),
      nodeResolve()
    ],
    entry: './src/index.js',
    dest: 'dist/index.esm.js',
    format: 'es',
    external: [ 'mathjs' ]
  }
];