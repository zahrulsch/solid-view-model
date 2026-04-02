import { defineConfig, mergeConfig } from "vite"
import { defineConfig as defineVitestConfig } from "vitest/config"

import dts from "vite-plugin-dts"
import solid from "vite-plugin-solid"

export default mergeConfig(
    defineConfig({
        plugins: [
            solid({
                hot: false,
                babel: {
                    plugins: [["@babel/plugin-proposal-decorators", { legacy: true }]],
                },
            }),
            dts({
                entryRoot: "src",
                copyDtsFiles: true,
                exclude: ["__tests__/*.{ts,tsx}", "__tests__/utils/*.{ts,tsx}"],
                bundledPackages: ["mutative", "type-fest"],
                compilerOptions: {
                    declarationMap: false,
                },
            }),
        ],
        build: {
            lib: {
                formats: ["es"],
                entry: {
                    index: "src/index.ts",
                    "listenable/index": "src/listenable/index.ts",
                    "components/index": "src/components/index.ts",
                    "decorators/index": "src/decorators/index.ts",
                },
            },
            minify: false,
            sourcemap: false,
            rollupOptions: {
                output: {
                    preserveModules: true,
                    preserveModulesRoot: "src",
                },
                external: ["solid-js", "@solidjs/router", "solid-js/web", "solid-js/store"],
            },
        },
    }),
    defineVitestConfig({
        test: {
            globals: true,
            environment: "jsdom",
            include: ["**/__tests__/**/*.test.{ts,tsx}"],
            server: {
                deps: {
                    inline: ["@solidjs/router"],
                },
            },
        },
    })
)
