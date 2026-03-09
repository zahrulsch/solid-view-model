/// <reference types="vitest/config" />

import { defineConfig } from "vite"
import solid from "vite-plugin-solid"

export default defineConfig({
    plugins: [solid({ hot: false })],
    test: {
        globals: true,
        environment: "jsdom",
        include: ["**/__test__/**/*.{test,spec}.{ts,tsx}"],
        setupFiles: ["node_modules/@testing-library/jest-dom/vitest"],
        server: {
            deps: {
                inline: ["@solidjs/router"],
            },
        },
    },
})
