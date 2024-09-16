import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [sveltekit(), mkcert()],
  resolve: {
    alias: {
      Buffer: "buffer",
      mqtt: "mqtt/dist/mqtt.js"
    }
  },
  server: {
    host: "0.0.0.0",
    proxy: {}
  }
});
