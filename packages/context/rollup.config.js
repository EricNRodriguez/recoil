import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import typescript from "rollup-plugin-typescript2";
import {nodeResolve} from "@rollup/plugin-node-resolve";

export default [
    {
        input: `index.ts`,
        output: [
            {
                file: `dist/context.js`,
                format: 'cjs',
                sourcemap: true,
                compact: true,
            },
        ],
        plugins: [
            esbuild(),
            nodeResolve(),
            // typescript({ tsconfig: 'tsconfig.json' })
        ]
    },
    {
        input: `index.ts`,
        plugins: [
            dts(),
            nodeResolve(),
            // typescript({ tsconfig: 'tsconfig.json' })
        ],
        output: {
            file: `dist/context.d.ts`,
            format: 'es',
        },
    }
]
