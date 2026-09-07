import type { Config } from "tailwindcss";

/**
 * ── BRAND RAMP ──────────────────────────────────────────────────────────────
 * James Hardie's primary brand colour is GREEN, taken from their own compiled
 * stylesheet: --primary-color-pure #00833E and --primary-color-high #163C20.
 *
 *   500 #00833E  brand green — primary CTAs, selection, accent rules
 *   600 #007035  pressed / hover
 *   700 #005C2C  deep green — secondary outlines, body-copy green
 *   800 #163C20  primary-color-high — large dark panels
 *
 * #00833E clears AA against white text at 4.87:1, so the brand green is used
 * directly on CTAs rather than a darkened approximation.
 * ────────────────────────────────────────────────────────────────────────────
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hardie: {
          DEFAULT: "#00833E",
          50: "#EFF8F2",
          100: "#D6EDDF",
          200: "#A8D8BC",
          300: "#6FBF93",
          400: "#2FA163",
          500: "#00833E", // brand green — CTAs, selection, accent rules
          600: "#007035", // pressed / hover
          700: "#005C2C", // deep green — outlines, green body copy
          800: "#163C20", // primary-color-high — large dark panels
          900: "#002A14",
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
