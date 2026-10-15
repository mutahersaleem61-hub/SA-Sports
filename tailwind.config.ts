import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0908",
        coal: "#14110e",
        leather: "#1d1813",
        gold: { DEFAULT: "#b8975a", light: "#d9bf86", dark: "#8a6d3b" },
        ivory: { DEFAULT: "#f3ecdc", dim: "#c9c0ab" },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Jost Variable"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
