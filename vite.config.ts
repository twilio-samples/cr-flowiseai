import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    // Library mode for Node.js
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["cjs"],
      fileName: "index",
    },
    // Target Node.js environment
    ssr: true,
    target: "node20",
    // Output directory
    outDir: "dist",
    // Don't minify for better debugging (optional)
    minify: false,
    // Bundle everything into one file
    rollupOptions: {
      output: {
        format: "cjs",
        // Single file output
        inlineDynamicImports: true,
      },
      external: [
        // Only exclude native modules that can't be bundled
        "bufferutil",
        "utf-8-validate",
      ],
    },
    // Empty out the directory first
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  // Suppress Vite's HMR/dev server features since this is a Node app
  server: {
    hmr: false,
  },
});
