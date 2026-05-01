/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ¡Esta línea es vital!
  ],
  theme: {
    extend: {
      colors: {
        'udp-neon': '#00ffc8', // Asegúrate de definir tu color personalizado aquí
      }
    },
  },
  plugins: [],
}