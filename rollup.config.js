import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel'

export default [
  {
    plugins: [
      commonjs(),
      nodeResolve(),
      babel({
        exclude: 'node_modules/**'
      })
    ],
    external: [ 'mathjs' ],    
    input: './src/index.js',
    output: [
      {
        file: 'dist/index.cjs.js',
        format: 'cjs'
      },
      {
        file: 'dist/index.esm.js',
        format: 'es'
      },
      {
        file: 'dist/index.browser.js',
        format: 'es',
        globals: {
          'mathjs': 'math'
        }
      }
    ]
  },
  {
    plugins: [
      commonjs(),
      nodeResolve(),
      babel({
        exclude: 'node_modules/**'
      })
    ],
    external: [ 'mathjs' ],
    input: './src/index.js',
    output: [
      {
        file: 'dist/index.browser.js',
        name: 'DiceRoll',
        format: 'iife',
        globals: {
          'mathjs': 'math'
        }
      }
    ]
  }
];