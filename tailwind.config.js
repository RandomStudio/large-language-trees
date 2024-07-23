/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        'roel_green': '#C8F58F',
        'roel_blue': '#0038FF',
        'dark_grey': '#302F2F',
        'mid_grey': '#898989',
        'light_grey': '#D9D9D9',
        'roel_purple': '#4B0082'
      },
      scale: {
        125: "1.25"
      },
      fontFamily: {
        'garamond': ['Garamond', 'serif'],
        'oldstandard': ['OldStandard', 'serif'],
        'inter': ['Inter', 'serif'],
        'primer': ['Primer', 'serif']
      },
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
