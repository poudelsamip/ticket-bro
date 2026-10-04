import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [react(), tailwindcss()],

        resolve: {
            alias: {
                "@": import.meta.dirname + "/src",
            },
        },

        server: {
            port: 5173,
            proxy: {
                "/api": {
                    target: env.VITE_API_URL.replace("/api", ""),
                    changeOrigin: true,
                },
            },
        },
    };
});
