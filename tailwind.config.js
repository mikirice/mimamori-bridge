/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4CAF50",
        "primary-dark": "#388E3C",
        "primary-light": "#C8E6C9",
        warning: "#FF9800",
        alert: "#F44336",
        surface: "#FFFFFF",
        background: "#FAFAFA",
        "text-primary": "#212121",
        "text-secondary": "#757575",
      },
    },
  },
  plugins: [],
};
