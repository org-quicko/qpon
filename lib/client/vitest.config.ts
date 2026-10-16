import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
	test: {
		// The only tests in this package are the per-client integration tests
		// under test/. Everything under src/ is generated SDK code.
		include: ["test/**/*.test.ts"],
		// Makes a local .env file work without pulling in dotenv. The empty prefix
		// loads every variable, not just the VITE_-prefixed ones.
		env: loadEnv(mode, process.cwd(), ""),
		testTimeout: 30_000,
		fileParallelism: false,
	},
}));
