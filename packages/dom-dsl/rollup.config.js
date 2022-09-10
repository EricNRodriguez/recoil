import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import excludeDependenciesFromBundle from "rollup-plugin-exclude-dependencies-from-bundle";
export default [
    {
        input: `./lib/index.ts`,
        plugins: [
            nodeResolve(),
            typescript({tsconfig: "./tsconfig.build.json"}),
            excludeDependenciesFromBundle({
                "peerDependencies": true,
                "dependencies": false,
            })
        ],
        output: [
            {
                file: `dist/index.js`,
                format: 'es',
                sourcemap: true,
                compact: true
            },
        ],
    }
]
