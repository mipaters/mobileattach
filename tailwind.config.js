/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        rogers: {
          500: "#da291c",
          600: "#bd2017",
        },
        ink: "#0b1018",
        navy: "#111827",
      },
      boxShadow: {
        panel: "0 18px 50px rgba(0,0,0,.14)",
      },
    },
  },
  plugins: [],
};
