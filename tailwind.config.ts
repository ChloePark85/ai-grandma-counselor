// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: "#FDF8F6",
          100: "#F2E8E5",
          200: "#EADDD7",
          300: "#E0CEC7",
          400: "#D2BAB0",
          500: "#C4A599",
          600: "#B58F82",
          700: "#A6786B",
          800: "#976254",
          900: "#8B4C3D",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};
