/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        1820: "1820px", // Custom media query for exactly 1820px
      },
    },
  },
  plugins: [],
};
