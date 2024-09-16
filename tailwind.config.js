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
        roel_yellow: '#EFE500',

        new_purple: '#4B00B2'
      },
      fontSize: {
        xs: '16px',
        small: '20px',
        medium: '24px',
        large: '28px',
        xl: '40px',
        '2xl': '64px',
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
        jeant: ["JeanT", "serif"],
        gyst: ["gyst-variable", "sans-serif"]
      },
      zIndex: {
        "-1": "-1"
      },
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
