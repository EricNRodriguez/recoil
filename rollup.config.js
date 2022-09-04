import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import typescript from "@rollup/plugin-typescript";

export default [
    {
        input: `./src/index.ts`,
        plugins: [
            esbuild(),
            typescript({tsconfig: "./tsconfig.build.json"}),
        ],
        output: [
            {
                file: `dist/index.js`,
                format: 'cjs',
                sourcemap: true,
                compact: true
            },
        ],
        external: [
            "typescript-monads"
        ]
    },
    {
        input: `./src/index.ts`,
        plugins: [
            dts(),
            typescript({tsconfig: "./tsconfig.build.json"}),
        ],
        output: {
            file: `dist/index.d.js`,
            format: 'es',
            sourcemap: true,
        },
        external: [
            "typescript-monads"
        ]
    }
]