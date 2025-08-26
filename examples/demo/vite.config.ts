import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: { open: "/index.html" },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        about: "about.html",
        alpine: "alpine.html",
      },
    },
  },
  plugins: [tailwindcss()],
});
