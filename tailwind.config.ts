import type { Config } from "tailwindcss";

/**
 * Brand tokens extracted from jameshardie.com's own compiled stylesheet so this
 * tool reads as part of the James Hardie system rather than a lookalike:
 *
 *   #00833e  primary green (the dominant brand color on jameshardie.com)
 *   #007035  green, pressed/hover state
 *   #262627  body ink        #23263b  deep navy-ink used for dark panels
 *   #f6f5f3  warm page ground        #f9f8f7  warm card white
 *   #d9d9d9 / #eaeaea  rules and borders
 *   #82705e  warm taupe      #ebaa6e  warm tan accent
 *
 * The scale below extends those anchors into usable steps. #00833e sits at 500
 * and clears AA against white text (4.87:1); steps 700-900 carry the large dark
 * panels, and green *text* on the light ground uses 600 or darker.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hardie: {
          DEFAULT: "#00833e",
          50: "#EFF8F2",
          100: "#D6EDDF",
          200: "#A8D8BC",
          300: "#6FBF93",
          400: "#2FA163",
          500: "#00833e",
          600: "#007035",
          700: "#005C2C",
          800: "#163C20",
          900: "#002A14",
        },
        // Named for the roles the components already use, remapped to JH ink.
        // JH's neutral ramp: text #333, muted #555, rules #DDD / #EEE.
        slateCharcoal: {
          DEFAULT: "#333333",
          light: "#555555",
          muted: "#6E6E6E",
          deep: "#163C20",
        },
        stone: {
          DEFAULT: "#F6F5F3",
          50: "#FBFAF9",
          100: "#F6F5F3",
          200: "#EEEEEE",
          300: "#DDDDDD",
          400: "#B9B9B9",
        },
        // secondary-color-* on jameshardie.com
        sand: {
          DEFAULT: "#D4CCC4",
          low: "#F6F5F3",
        },
        gold: {
          DEFAULT: "#EBAA6E",
          light: "#F2C491",
          dark: "#8A5A22",
        },
        taupe: {
          DEFAULT: "#82705E",
          light: "#A8988A",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-helvetica-pro)",
          "Helvetica Now Display",
          "Helvetica Neue",
          "Helvetica",
          "Inter",
          "Arial",
          "sans-serif",
        ],
      },
      // JH blocks are flat. "card" is intentionally near-invisible and kept only
      // so overlays (modals) have something to lift with.
      boxShadow: {
        card: "none",
        lifted: "0 2px 4px rgba(51, 51, 51, 0.06), 0 18px 40px -18px rgba(51, 51, 51, 0.28)",
      },
      fontSize: {
        "16p": ["1rem", { lineHeight: "1.375rem" }],
        "20p": ["1.25rem", { lineHeight: "1.5rem" }],
        "24p": ["1.5rem", { lineHeight: "1.75rem" }],
        "28p": ["1.75rem", { lineHeight: "2rem" }],
        "32p": ["2rem", { lineHeight: "2.25rem" }],
        "40p": ["2.5rem", { lineHeight: "2.75rem" }],
        "48p": ["3rem", { lineHeight: "3.25rem" }],
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
