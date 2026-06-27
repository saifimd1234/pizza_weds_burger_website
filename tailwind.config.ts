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
        charcoal: "#120c0a",
        night: "#1b1310",
        coal: "#241813",
        ember: "#e2391d",
        chili: "#ff4d2e",
        flame: "#ff7a18",
        gold: "#ffb020",
        cheese: "#ffd84d",
        cream: "#fff4e6",
        basil: "#46a64f",
      },
      fontFamily: {
        display: ["var(--font-anton)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        script: ["var(--font-caveat)", "cursive"],
      },
      boxShadow: {
        ember: "0 20px 60px -20px rgba(226, 57, 29, 0.6)",
        gold: "0 18px 50px -18px rgba(255, 176, 32, 0.55)",
        soft: "0 30px 80px -40px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "heat-grid":
          "radial-gradient(circle at 20% 20%, rgba(255,122,24,0.12), transparent 45%), radial-gradient(circle at 80% 0%, rgba(226,57,29,0.16), transparent 40%), radial-gradient(circle at 50% 100%, rgba(255,176,32,0.1), transparent 50%)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1", transform: "scaleY(1)" },
          "50%": { opacity: "0.78", transform: "scaleY(1.08)" },
        },
        steam: {
          "0%": { opacity: "0", transform: "translateY(0) scale(1)" },
          "30%": { opacity: "0.5" },
          "100%": { opacity: "0", transform: "translateY(-60px) scale(1.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "marquee-fast": "marquee 18s linear infinite",
        "spin-slow": "spinSlow 26s linear infinite",
        floaty: "floaty 6s ease-in-out infinite",
        flicker: "flicker 1.6s ease-in-out infinite",
        steam: "steam 4s ease-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
