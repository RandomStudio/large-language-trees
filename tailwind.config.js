/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        'roel_green': '#9EE093',
        'roel_blue': '#0038FF',
      },
      scale: {
        '125': '1.25',
      },
      fontFamily: {
        'garamond': ['Garamond', 'serif'],
        'oldstandard': ['OldStandard', 'serif'],
        'inter': ['Inter','serif']
      },
    }
  },
  plugins: [],
}
