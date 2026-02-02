import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import viteReact from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    devtools(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["TrackiFi-logo.png"],
      manifest: {
        name: "TrackiFi",
        short_name: "TrackiFi",
        description: "Personal Finance Tracker",
        theme_color: "#ffffff",
        icons: [
          {
            src: "TrackiFi-logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "TrackiFi-logo.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "TrackiFi-logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        orientation: "portrait",
        shortcuts: [
          {
            name: "Add Transaction",
            short_name: "Add",
            description: "Quickly add a new transaction",
            url: "/dashboard?action=new",
            icons: [{ src: "TrackiFi-logo.png", sizes: "192x192" }],
          },
          {
            name: "View Analytics",
            short_name: "Analytics",
            description: "View your spending insights",
            url: "/analytics",
            icons: [{ src: "TrackiFi-logo.png", sizes: "192x192" }],
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern:
              /^https:\/\/trackifi-api\.trackifi\.workers\.dev\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }) as any,
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
