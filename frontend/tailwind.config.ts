import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:           "#00332a",
        "primary-hover":   "#1b4a40",
        forest:            "#1b4a40",
        secondary:         "#735a3a",
        "timber-oak":      "#a68966",
        surface:           "#fcf9f8",
        "earth-sand":      "#f4f1ea",
        "snow-peak":       "#ffffff",
        "on-surface":      "#1b1c1c",
        "on-surface-var":  "#404846",
        outline:           "#707976",
        "outline-var":     "#c0c8c4",
        error:             "#ba1a1a",
        // status
        "status-confirmed":"#1b4a40",
        "status-pending":  "#b8860b",
        "status-blocked":  "#707976",
        // payment
        "visa-blue":       "#1a1f71",
        "mc-red":          "#eb001b",
        "mbank-cyan":      "#00adef",
      },
      fontFamily: {
        serif:  ["Playfair Display", "Georgia", "serif"],
        sans:   ["Montserrat", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0",
        none:    "0",
        sm:      "0",
        md:      "0",
        lg:      "0",
        xl:      "0",
        full:    "9999px",  // only for pill-shaped lang toggle
      },
      fontSize: {
        "display-lg":  ["56px", { lineHeight: "1.1",  fontWeight: "700",  letterSpacing: "-0.02em" }],
        "display-mob": ["36px", { lineHeight: "1.2",  fontWeight: "700" }],
        "headline-md": ["32px", { lineHeight: "1.3",  fontWeight: "600" }],
        "headline-sm": ["24px", { lineHeight: "1.4",  fontWeight: "600" }],
        "body-lg":     ["18px", { lineHeight: "1.6",  fontWeight: "400" }],
        "body-md":     ["16px", { lineHeight: "1.6",  fontWeight: "400" }],
        "label-bold":  ["14px", { lineHeight: "1.2",  fontWeight: "700",  letterSpacing: "0.1em" }],
        "label-sm":    ["12px", { lineHeight: "1.2",  fontWeight: "500" }],
      },
      spacing: {
        "section":   "120px",
        "section-m": "64px",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
