import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
    {
        input: `./lib/index.ts`,
        plugins: [
            nodeResolve(),
            typescript({tsconfig: "./tsconfig.build.json"}),
        ],
        output: [
            {
                file: `dist/index.js`,
                format: 'es',
                sourcemap: true,
                compact: true
            },
        ]
    }
]
