import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~bootstrap": require("path").resolve(
        __dirname,
        "node_modules/bootstrap"
      ),
    },
  },
});
