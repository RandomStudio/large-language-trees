/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        'roel_green': '#9EE093',
        'roel_blue': '#0038FF',
      },
      scale: {
        '125': '1.25', // Represents scaling to 125%
      },
    }
  },
  plugins: [],
}
