import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        lang: "ru",
        dir: "ltr",
        name: "Расписание занятий Кубанского ГАУ",
        short_name: "Расписание",
        description:
          "Официальное расписание занятий Кубанского государственного аграрного университета",
        theme_color: "#000",
        background_color: "#000",
        display: "standalone",
        icons: [
          {
            src: "android-chrome-36x36.png",
            sizes: "36x36",
            type: "image/png",
          },
          {
            src: "android-chrome-48x48.png",
            sizes: "48x48",
            type: "image/png",
          },
          {
            src: "android-chrome-72x72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "android-chrome-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "android-chrome-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "android-chrome-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "android-chrome-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  base: "/kubsau-schedule/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@app": fileURLToPath(new URL("./src/app", import.meta.url)),
      "@components": fileURLToPath(
        new URL("./src/components", import.meta.url),
      ),
      "@tests": fileURLToPath(new URL("./src/tests", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      "@types": fileURLToPath(new URL("./src/types", import.meta.url)),
    },
  },
});
