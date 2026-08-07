import { build } from "esbuild";
import { statSync } from "fs";

await build({
  entryPoints: ["src/app/main.ts"],
  bundle: true,
  outfile: "dist/app.js",
  format: "esm",
  target: "es2019",
  minify: true,
  sourcemap: false,
});

const { size } = statSync("dist/app.js");
const kb = (size / 1024).toFixed(1);
console.log(`dist/app.js: ${kb} KB`);
if (size > 100 * 1024) {
  console.warn(`WARNING: over the 100KB budget (${kb} KB)`);
}
