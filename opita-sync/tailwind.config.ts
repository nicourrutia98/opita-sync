import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./stories/**/*.{ts,tsx}", "./.storybook/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        subtle: "rgb(var(--color-subtle) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--color-brand) / <alpha-value>)",
          strong: "rgb(var(--color-brand-strong) / <alpha-value>)",
          soft: "rgb(var(--color-brand-soft) / <alpha-value>)"
        },
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        info: "rgb(var(--color-info) / <alpha-value>)"
      },
      boxShadow: {
        panel: "0 22px 60px rgba(15, 23, 42, 0.12)",
        soft: "0 10px 24px rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        shell: "20px",
        panel: "16px"
      },
      fontFamily: {
        sans: ['\"Segoe UI\"', "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
