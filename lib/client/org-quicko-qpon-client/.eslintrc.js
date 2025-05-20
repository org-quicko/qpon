module.exports = {
	extends: ["eslint:recommended", "airbnb", "plugin:@typescript-eslint/recommended", "prettier"],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	root: true,
	rules: {
		"no-shadow": "off",
		"@typescript-eslint/no-shadow": ["error"],
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"no-console": ["error"],
		"import/no-extraneous-dependencies": "off",
		"prefer-const": "error",
		"no-var": "error",
		"import/no-unresolved": "off",
		"no-restricted-syntax": "off",
		"class-methods-use-this": "off",
		"import/extensions": [
			"error",
			"ignorePackages",
			{
				js: "never",
				jsx: "never",
				ts: "never",
				tsx: "never",
			},
		],
		"import/prefer-default-export": "off",
		"dot-notation": "off",
		"object-shorthand": "off"
	},
	settings: {
		"import/resolver": {
			node: {
				extensions: [".js", ".jsx", ".ts", ".tsx"],
			},
		},
	},
};
