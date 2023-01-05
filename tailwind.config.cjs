/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "nu-purple-30": "#B6ACD1",
      },
      screens: {
        "3xl": "2000px",
      },
    },
  },
  plugins: [],
};
