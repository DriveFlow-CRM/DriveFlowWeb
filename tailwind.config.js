/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#44D9E6',      // Turquoise from logo
        'primary-dark': '#2A878F', // Darker turquoise from logo
        'dark': '#1D1D1B',         // Almost black from logo
        'light': '#F8FAFC',        // Very light gray
        'gray': '#1A1A1A',         // Gray from logo
      },
    },
  },
  plugins: [],
}
