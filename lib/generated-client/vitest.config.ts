import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Generated client tests live alongside each client under src/<tag>/tests/.
		// They are live integration tests: set a real baseUrl + credentials in each
		// client and run against a reachable API.
		include: ["src/**/*.test.ts"],
		testTimeout: 30000,
	},
});
