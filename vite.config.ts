import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/ull-auditorium-seating/",
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "node",
  },
});
