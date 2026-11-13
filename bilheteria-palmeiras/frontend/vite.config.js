import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const proxy = {
  "/api": process.env.VITE_PROXY_TARGET || "http://127.0.0.1:8081",
};

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
  test: { environment: "jsdom", include: ["src/**/*.test.jsx"] },
});
