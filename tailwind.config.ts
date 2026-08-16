import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          navy: "#0B1E3D",
          navyDeep: "#071429",
          navyLight: "#132a52",
          cyan: "#00C2D1",
          cyanSoft: "#5FE3EC",
          gold: "#C9A227",
          goldSoft: "#E4C55C",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-body)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      backgroundImage: {
        "jarvis-gradient":
          "radial-gradient(circle at 20% 20%, rgba(0,194,209,0.18), transparent 45%), radial-gradient(circle at 80% 0%, rgba(201,162,39,0.12), transparent 40%), linear-gradient(180deg, #0B1E3D 0%, #071429 100%)",
        "jarvis-gradient-soft":
          "linear-gradient(180deg, #0B1E3D 0%, #0E2549 100%)",
        "card-glow":
          "linear-gradient(135deg, rgba(0,194,209,0.08) 0%, rgba(201,162,39,0.05) 100%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,194,209,0.15), 0 8px 30px rgba(0,194,209,0.15)",
        "glow-lg":
          "0 0 0 1px rgba(0,194,209,0.2), 0 20px 60px -10px rgba(0,194,209,0.25)",
        gold: "0 8px 30px rgba(201,162,39,0.25)",
        card: "0 4px 24px rgba(2,8,23,0.35)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scan: "scan 3.2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        scan: {
          "0%, 100%": { top: "0%", opacity: "0" },
          "10%": { opacity: "1" },
          "50%": { top: "97%", opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
