import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		files: ["**/*.ts"],
		ignores: ["dist/**", "node_modules/**", ".eslintrc.js", "*.config.js", "tests/**"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				project: "./tsconfig.json",
			},
		},
		plugins: {
			"@typescript-eslint": typescriptEslint,
		},
		rules: {
			"no-shadow": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-shadow": ["error"],
			"@typescript-eslint/no-non-null-assertion": "off",
			"import/no-extraneous-dependencies": "off",
			"no-console": ["error"],
			"prefer-const": "error",
			"no-var": "error",
			"import/no-unresolved": "off",
			"no-restricted-syntax": "off",
			"class-methods-use-this": "off",
		},
		settings: {
			"import/resolver": {
				node: {
					extensions: [".js", ".jsx", ".ts", ".tsx"],
				},
			},
		},
	},
	prettier,
]);