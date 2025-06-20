import { defineConfig } from "./client/node_modules/vitest/config";

export default defineConfig({
  test: {
    projects: ["./client"],
  },
});
