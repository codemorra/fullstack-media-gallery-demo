import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import babel from "@rolldown/plugin-babel";

// GitHub Pages serves this project under the repository name.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/fullstack-media-gallery-demo/" : "/",
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
}));
