/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        roel_green: "#C8F58F",
        roel_blue: "#670093",
        dark_grey: "#302F2F",
        mid_grey: "#898989",
        light_grey: "#D9D9D9",
        roel_purple: "#670093",
        roel_rose: "#FFB9C6",
        roel_red: "#F31C1C",
        roel_yellow: '#EFE500'
      },
      scale: {
        125: "1.25"
      },
      fontFamily: {
        garamond: ["Garamond", "serif"],
        oldstandard: ["OldStandard", "serif"],
        inter: ["Inter", "serif"],
        primer: ["Primer", "serif"],
        primerb: ["PrimerB", "serif"],
        jeanb: ["JeanB", "serif"],
        jeant: ["JeanT", "serif"]
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
