/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}'
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        // Inter — UI & body text (all weights actively used)
        'inter-medium': ['Inter-Medium'],
        'inter-semibold': ['Inter-SemiBold'],
        'inter-bold': ['Inter-Bold'],
        'inter-extrabold': ['Inter-ExtraBold'],
        'inter-black': ['Inter-Black'],
        // Outfit — headings only (bold weights)
        'outfit-bold': ['Outfit-Bold'],
        'outfit-extrabold': ['Outfit-ExtraBold'],
        'outfit-black': ['Outfit-Black'],
      },
    },
  },
  plugins: [],
};
