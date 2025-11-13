import { glob } from "glob";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts"

const getExternals = () => {
  const base = ['reflect-metadata', 'class-validator', 'class-transformer', '@org-quicko/core', '@org-quicko/sheet'];

  return base;
};

const getAllSourceModules = () => glob.sync(["generated/**/index.ts", "src/**/index.ts"]);

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
    plugins: [dts({
      compilerOptions: {
        rootDir: "./",
      }
    })],
    output: [
      {
        dir: "dist/types",

      },
    ],
  },
];
