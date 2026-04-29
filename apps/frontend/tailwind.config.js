/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "SF Pro Text", "system-ui", "sans-serif"]
      },
      colors: {
        sonic: {
          bg: "#050505",
          panel: "rgba(255,255,255,0.06)",
          line: "rgba(255,255,255,0.12)",
          glow: "#7dd3fc",
          accent: "#fafafa"
        }
      },
      boxShadow: {
        sonic: "0 32px 120px rgba(0, 0, 0, 0.45)"
      },
      letterSpacing: {
        tighter2: "-0.06em"
      }
    }
  },
  plugins: []
};
