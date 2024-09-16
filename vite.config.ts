import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

// @ts-expect-error No idea why
export default defineConfig(() => {
  const useHttps = process.env.USE_HTTPS === 'true';

  return {
    plugins: [
      sveltekit(),
      ...(useHttps ? [mkcert()] : [])  // Conditionally include mkcert
    ],
    resolve: {
      alias: {
        Buffer: "buffer",
        mqtt: "mqtt/dist/mqtt.js"
      }
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      https: useHttps,  // Enable HTTPS if `USE_HTTPS` is true
      proxy: {}
    }
  };
});
