/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        kahoot: {
          purple:       '#46178f',
          'purple-dark':'#2d0e5c',
          'purple-mid': '#3a1278',
          red:          '#e21b3c',
          blue:         '#1368ce',
          yellow:       '#d89e00',
          green:        '#26890c',
          pink:         '#ff3355',
          gold:         '#f7a600',
          muted:        '#c9a8f5',
          glass:        'rgba(255,255,255,0.12)',
        }
      }
    }
  },
  plugins: []
}
