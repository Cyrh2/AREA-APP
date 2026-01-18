/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        discord: {
          blurple: '#5865F2',
          green: '#57F287',
          yellow: '#FEE75C',
          fuchsia: '#EB459E',
          red: '#ED4245',
          dark: {
            DEFAULT: '#36393f',
            darker: '#2f3136',
            light: '#40444b',
            lightest: '#202225'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Rubik', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

