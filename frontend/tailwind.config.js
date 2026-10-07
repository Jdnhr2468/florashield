module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#2D6A4F',
        primaryDark: '#1B4332',
        textDark: '#1E2D27',
        textMuted: '#4F6F67',
        borderLight: '#E2EBE9',
        bgPage: '#F3F7F5',
        iconGreenBg: '#E8F5E9',
        iconBlueBg: '#E8F1F5',
        iconBlue: '#2A6F97',
      }
    },
  },
  plugins: [],
}