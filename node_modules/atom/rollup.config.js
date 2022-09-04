import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
// import typescript from "rollup-plugin-typescript2";

export default [
    {
        input: `./index.ts`,
        output: [
            {
                file: `dist/atom.js`,
                format: 'cjs',
                sourcemap: true,
                compact: true,
            },
        ],
        plugins: [
            esbuild(),
            // typescript({ tsconfig: 'tsconfig.json' })
        ]
    },
    {
        input: `./index.ts`,
        plugins: [
            dts(),
            // typescript({ tsconfig: 'tsconfig.json' })
        ],
        output: {
            file: `dist/atom.d.ts`,
            format: 'es',
            sourcemap: true,
        },
    }
]
