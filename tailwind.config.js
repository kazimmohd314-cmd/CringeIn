/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        darkbg: '#0E0E0E',
        lightbg: '#FAFAF7',
        darktext: '#F2F0E8',
        lighttext: '#141414',
        linkedin: {
          DEFAULT: '#0A66C2',
          hover: '#08529C',
        },
        acidlime: {
          DEFAULT: '#C8FF3D',
          hover: '#b5ec28',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '-apple-system', 'sans-serif'],
        sans: ['"Hanken Grotesk"', '-apple-system', 'sans-serif'],
        handwriting: ['"Caveat"', 'cursive'],
      },
      borderRadius: {
        xl: '12px',
      },
      boxShadow: {
        'hard-dark': '4px 4px 0px #F2F0E8',
        'hard-light': '4px 4px 0px #141414',
        'hard-black': '4px 4px 0px #000000',
        'soft-card': '0 2px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
