import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Only proxy /api when a backend is listening (e.g. `npx vercel dev --listen 3000`).
  // Without this, `npm run dev` alone uses the OTP fallback in useOTPAuth — no ECONNREFUSED spam.
  const devApiOrigin = env.VITE_DEV_PROXY_API?.replace(/\/$/, "") || "";

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      ...(devApiOrigin
        ? {
            proxy: {
              "/api": {
                target: devApiOrigin,
                changeOrigin: true,
              },
            },
          }
        : {}),
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
