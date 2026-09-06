/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#FFD700",
          50: "#FFF9E6",
          100: "#FFF0B3",
          200: "#FFE680",
          300: "#FFDB4D",
          400: "#FFD11A",
          500: "#FFD700",
          600: "#E6C200",
          700: "#CCAD00",
          800: "#B39700",
          900: "#998000",
        },
        green: {
          DEFAULT: "#1A8A3F",
          50: "#E6F5EA",
          100: "#B3DFC2",
          200: "#80C999",
          300: "#4DB371",
          400: "#1A9C45",
          500: "#1A8A3F",
          600: "#157835",
          700: "#10662B",
          800: "#0C5422",
          900: "#084219",
        },
      },
      borderColor: {
        DEFAULT: "hsl(214.3 31.8% 91.4%)",
      },
    },
  },
  plugins: [],
}