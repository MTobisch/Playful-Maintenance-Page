import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  root: "src",
  plugins: [checker({ typescript: true }), viteSingleFile()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    minify: true,
  },
});
