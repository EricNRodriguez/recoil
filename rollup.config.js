import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

export default [
    {
        input: `index.ts`,
        plugins: [esbuild()],
        output: [
            {
                file: `dist/bundle.js`,
                format: 'cjs',
                sourcemap: true,
                // exports: 'default',
            },
        ]
    },
    {
        input: `index.ts`,
        plugins: [dts()],
        output: {
            file: `dist/bundle.d.ts`,
            format: 'es',
        },
    }
]