/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        1720: "1720px", // Custom media query for exactly 1820px
      },
    },
  },
  plugins: [],
};
