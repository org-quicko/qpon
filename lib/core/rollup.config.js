import path from "path";
import { glob } from "glob";
import { createRequire } from "module";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const getExternals = () => {
	const base = [...Object.keys(pkg.dependencies || {})];

	return base;
};

const getAllSourceModules = () => glob.sync(["src/*/index.ts", "src/*/*/index.ts", "src/index.ts"]).map((module) => path.posix.normalize(module).replace(/\\/g, "/"));

export default [
	{
		input: getAllSourceModules(),
		external: getExternals(),
		plugins: [
			typescript({
				tsconfig: "./tsconfig.json",
				declaration: false,
				rootDir: "./",
				outDir: undefined,
				exclude: ["node_modules/**", "dist/**"],
			}),
		],
		output: [
			{
				dir: "dist/cjs",
				format: "cjs",
				preserveModules: true,
				preserveModulesRoot: "src",
				entryFileNames: "[name].cjs",
			},
			{
				dir: "dist/esm",
				format: "esm",
				preserveModules: true,
				preserveModulesRoot: "src",
			},
		],
	},

	{
		input: getAllSourceModules(),
		plugins: [
			dts(),
		],
		output: [
			{
				dir: "dist/types",
				preserveModules: true,
				preserveModulesRoot: ".",
			},
		],
	},
];
