/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      width: {
        '1/6': '16.666667%',
        '2/6': '33.333333%',
        '3/6': '50%',
        '4/6': '66.666667%',
        '5/6': '83.333333%',
      },
      height: {

      },
      minHeight: {
        '1/6': '16.666667%',
        '2/6': '33.333333%',
        '3/6': '50%',
        '4/6': '66.666667%',
        '5/6': '83.333333%',
      },
      colors: {
        skyBlue: '#00A6FB',
        deepSkyBlue: '#0582CA',
        tealBlue: '#006494',
        navyBlue: '#003554',
        darkBlue: '#051923',
      },
    },
  },
  plugins: [],
}

