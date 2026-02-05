import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          primary: "#4dd0e1",
          secondary: "#42a5f5",
          accent: "#7e57c2",
          dark: "#5c6bc0",
        },
        surface: {
          DEFAULT: "rgba(17, 24, 39, 0.3)",
          solid: "#161b22",
        },
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #4dd0e1 0%, #42a5f5 35%, #5c6bc0 70%, #7e57c2 100%)",
        "gradient-brand-short": "linear-gradient(135deg, #4dd0e1 0%, #42a5f5 100%)",
      },
      boxShadow: {
        brand: "0 5px 20px rgba(77, 208, 225, 0.3)",
        "brand-lg": "0 8px 25px rgba(77, 208, 225, 0.5)",
        glass: "0 10px 40px rgba(0, 0, 0, 0.2)",
        "glass-hover": "0 20px 60px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "fade-in-up": "fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fadeIn 0.3s ease",
        "slide-in-right": "slideInRight 0.4s ease forwards",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}

export default config
