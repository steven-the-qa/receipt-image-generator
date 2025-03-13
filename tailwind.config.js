/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Rubik'],
        'mono': ["'IBM Plex Mono'"]
      },
      colors: {
        'green': '#4cd137',
        'dark-green': '#2ecc71',
        'light-green': '#7bed9f',
        'black': '#1e272e',
        'dark-gray': '#2d3436',
        'white': '#f5f6fa',
        'gray': '#dcdde1'
      }
    },
  }
}