export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        goldSoft: '#E8D48A',
        grayDark: '#2B2B2B',
        grayLight: '#F5F5F5',
        roseNude: '#CFA5A5'
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Poppins', 'sans-serif']
      }
    },
  },
  plugins: [],
}
