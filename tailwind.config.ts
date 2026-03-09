import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: "#0a0a0a",
          card: "#141414",
          border: "#262626",
          accent: "#c8a960",
          "accent-dim": "#8b7340",
          green: "#22c55e",
          red: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
