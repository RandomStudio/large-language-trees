import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      Buffer: "buffer",
      mqtt: "mqtt/dist/mqtt.js"
    }
  }
});
