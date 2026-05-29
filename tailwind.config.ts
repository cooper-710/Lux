import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sequence: {
          orange: "#ff8a3d",
          ink: "#050505",
          graphite: "#101010",
          panel: "#151515",
          line: "rgba(255,255,255,0.11)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        surface: "0.25rem",
      },
      maxWidth: {
        report: "112.5rem",
      },
      boxShadow: {
        report: "0 24px 80px rgba(0,0,0,0.38)",
      },
    },
  },
  plugins: [],
};

export default config;
