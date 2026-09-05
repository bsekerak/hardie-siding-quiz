import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hardie: {
          DEFAULT: "#16382C",
          50: "#EDF2EF",
          100: "#D6E2DA",
          200: "#A9C2B4",
          300: "#7BA18E",
          400: "#4E8168",
          500: "#2F6350",
          600: "#22503F",
          700: "#16382C",
          800: "#102A21",
          900: "#0A1B15",
        },
        slateCharcoal: {
          DEFAULT: "#1E293B",
          light: "#334155",
          muted: "#64748B",
        },
        stone: {
          DEFAULT: "#F4F1EA",
          50: "#FBFAF7",
          100: "#F4F1EA",
          200: "#E7E1D4",
          300: "#D5CCB8",
          400: "#B8AC91",
        },
        gold: {
          DEFAULT: "#C8963E",
          light: "#E0B76A",
          dark: "#A2762B",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 42, 33, 0.04), 0 8px 24px -12px rgba(16, 42, 33, 0.18)",
        lifted: "0 2px 4px rgba(16, 42, 33, 0.06), 0 18px 40px -18px rgba(16, 42, 33, 0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
