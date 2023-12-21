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
        'green': '#fbc531',
        'blue': '#00a8ff',
        'green': '#4cd137',
        'white': '#f5f6fa',
        'gray': '#dcdde1'
      }
    },
  }
}