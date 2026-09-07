import type { Config } from "tailwindcss";

/**
 * ── BRAND RAMP ──────────────────────────────────────────────────────────────
 * The `hardie` scale below is the single place the primary hue is defined;
 * every component reads it through `hardie-*` classes.
 *
 * Currently set to the specified Hardie Deep Navy (#002F6C / #0056B3).
 *
 * NOTE: jameshardie.com's own compiled stylesheet uses GREEN as its primary
 * (--primary-color-pure #00833E, --primary-color-high #163C20); navy does not
 * appear in their system. To switch back, replace the six mid/dark steps below
 * with: 500 #00833E, 600 #007035, 700 #005C2C, 800 #163C20, 900 #002A14.
 * ────────────────────────────────────────────────────────────────────────────
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hardie: {
          DEFAULT: "#002F6C",
          50: "#F2F6FC",
          100: "#E6EEF8",
          200: "#BFD4F1",
          300: "#7FA9E4",
          400: "#3B7DD8",
          500: "#0056B3", // accent — links, hover, subheadings
          600: "#00448F",
          700: "#002F6C", // primary — hero, headers, primary CTA
          800: "#002450",
          900: "#001731",
        },
        // Editorial ink. Body copy and technical callouts.
        slateCharcoal: {
          DEFAULT: "#1A202C",
          light: "#2D3748",
          muted: "#4A5568",
          deep: "#1A202C",
        },
        // Architectural warm white / putty — alternating background bands.
        stone: {
          DEFAULT: "#F8F9FA",
          50: "#FFFFFF",
          100: "#F8F9FA",
          200: "#F1F3F5",
          300: "#E2E8F0",
          400: "#CBD5E1",
          500: "#94A3B8",
        },
        // Heritage ochre — badges, warranty highlights, ratings.
        gold: {
          DEFAULT: "#D99B26",
          light: "#E8B75C",
          dark: "#8A6114",
        },
        sand: { DEFAULT: "#E2E8F0", low: "#F1F3F5" },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Inter",
          "Neue Haas Grotesk Display",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "16p": ["1rem", { lineHeight: "1.5rem" }],
        "20p": ["1.25rem", { lineHeight: "1.6rem" }],
        "24p": ["1.5rem", { lineHeight: "1.85rem" }],
        "28p": ["1.75rem", { lineHeight: "2.05rem" }],
        "32p": ["2rem", { lineHeight: "2.25rem" }],
        "40p": ["2.5rem", { lineHeight: "2.7rem" }],
        "48p": ["3rem", { lineHeight: "3.2rem" }],
      },
      borderRadius: { xl2: "2px" },
      // Structural edges only. No floating elevation anywhere in the app.
      boxShadow: {
        card: "none",
        lifted: "0 12px 32px -12px rgba(26, 32, 44, 0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-up": "fade-up 0.35s ease-out both" },
    },
  },
  plugins: [],
};

export default config;
