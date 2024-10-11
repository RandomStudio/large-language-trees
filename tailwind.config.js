/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        roel_green: "#C8F58F",
        roel_rose: "#FFB9C6",
        roel_purple: "#4B0082"
      },
      fontSize: {
        small: "16px",
        medium: "21px",
        large: "25px",
        xl: "39px"
      },
      scale: {
        125: "1.25"
      },
      fontFamily: {
        primer: ["Primer", "sans-serif"],
        gyst: ["gyst-variable", "serif"]
      },
      zIndex: {
        "-1": "-1"
      }
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
  plugins: [require("@tailwindcss/forms")]
};
