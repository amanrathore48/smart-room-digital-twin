/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin-slow 4s linear infinite",
        "spin-reverse": "spin-reverse 2s linear infinite",
        "pulse-scale": "pulse-scale 2s ease-in-out infinite",
        blink: "blink 1.4s infinite both",
      },
      keyframes: {
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "spin-reverse": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "pulse-scale": {
          "0%, 100%": { transform: "scale(0.8)" },
          "50%": { transform: "scale(1.2)" },
        },
        blink: {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
