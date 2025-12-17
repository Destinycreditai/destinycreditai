/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-black': '#0B0B0B',
        'primary-green': '#009933',
        'pure-white': '#FFFFFF',
        'light-gray': '#F8F9FA',
        'border-gray': '#E5E7EB',
      },
      fontFamily: {
        'sans': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      lineHeight: {
        'relaxed': '1.7',
      },
      letterSpacing: {
        'tight': '-0.01em',
      },
    },
  },
  plugins: [],
}

