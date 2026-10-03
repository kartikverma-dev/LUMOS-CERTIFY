import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        volt: {
          DEFAULT: "#E2F952",
          50: "#FAFEED",
          100: "#F4FED3",
          200: "#EDFCA4",
          300: "#E2F952",
          400: "#D4F61F",
          500: "#BEE409",
          600: "#95B503",
        },
        obsidian: {
          DEFAULT: "#0A0A0A",
          50: "#1A1A1A",
          100: "#141414",
          200: "#0F0F0F",
          300: "#0A0A0A",
          400: "#060606",
          500: "#030303",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--font-inter)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
