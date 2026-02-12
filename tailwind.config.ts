import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        memory: "0 30px 120px rgba(0, 0, 0, 0.22)",
      },
      backgroundImage: {
        "film-grain": "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2), transparent 36%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.14), transparent 30%)",
      },
      animation: {
        "float-slow": "float 7s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
