/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        roel_green: "#C8F58F",
        roel_blue: "#4B0082",
        dark_grey: "#302F2F",
        mid_grey: "#898989",
        light_grey: "#D9D9D9"
      },
      scale: {
        125: "1.25"
      },
      fontFamily: {
        garamond: ["Garamond", "serif"],
        oldstandard: ["OldStandard", "serif"],
        inter: ["Inter", "serif"],
        jeanluc: ["JeanLucWeb-Bold", "serif"],
        primer: ["MD Primer", "serif"]
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
