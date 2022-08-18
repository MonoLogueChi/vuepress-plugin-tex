import gulp from "gulp";
import { task, exec, stream } from "gulp-execa";
import jsonEditor from "gulp-json-editor";
import rimraf from "gulp-rimraf";
import ts from "gulp-typescript";
import replace from "gulp-replace";
import rename from "gulp-rename";

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { src, dest, series, parallel } = gulp;
const outputDir = resolve(__dirname, "dist");
const inputDir = resolve(__dirname, "src");
const tempDir = resolve(__dirname, "temp");

const version = async () => {
  await exec("git describe --tags", {
    shell: true,
    all: true,
  });
};

const cleanOut = () => src(outputDir, { allowEmpty: true }).pipe(rimraf());
const cleanTemp = () => src(tempDir, { allowEmpty: true }).pipe(rimraf());

const tsc1 = () => {
  const tsProject = ts.createProject("tsconfig.esm.json");
  return tsProject
    .src()
    .pipe(tsProject())
    .pipe(
      rename((path) => {
        if (path.extname === ".js") {
          path.extname = ".mjs";
        }
      })
    )
    .pipe(dest(tempDir));
};

const tsc2 = () => {
  const tsProject = ts.createProject("tsconfig.cjs.json");
  return (
    src(resolve(inputDir, "**/*.ts"))
      .pipe(replace("export default", "module.exports ="))

      .pipe(tsProject())
      // .pipe(
      //   rename((path) => {
      //     if (path.extname === ".js") {
      //       path.extname = ".cjs";
      //     }
      //   })
      // )
      .pipe(dest(tempDir))
  );
};

const cpVue = () => src(resolve(inputDir, "**/*.vue")).pipe(dest(outputDir));
const cpCss = () => src(resolve(inputDir, "**/*.css")).pipe(dest(outputDir));

const cpPackageJson = () => {
  return src("package.json")
    .pipe(
      jsonEditor({
        // version: version,
        type: "commonjs",
        main: "index.js",
        module: "index.mjs",
        exports: {
          import: "./index.mjs",
          require: "./index.js",
        },
        types: "./index.d.ts",
      })
    )
    .pipe(src("readme.md"))
    .pipe(src("LICENSE"))
    .pipe(dest(outputDir));
};

const cpTempJs = () =>
  src([
    resolve(tempDir, "**/*.js"),
    resolve(tempDir, "**/*.d.ts"),
    resolve(tempDir, "**/*.mjs"),
    resolve(tempDir, "**/*.cjs"),
  ]).pipe(dest(outputDir));

const cpJs = () => src(resolve(inputDir, "**/*.js")).pipe(dest(outputDir));

export const build = series(
  cleanTemp,
  // tsc1,
  tsc2,
  cleanOut,
  cpTempJs,
  cpVue,
  cpCss,
  cpPackageJson,
  cpJs,
  cleanTemp
);
