/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFFDFA',
        dark: '#191512',
        muted: '#8E867A',
        border: '#EAE3D7',
        light: '#F1ECE1',
        surface: '#FFFDFA',
      },
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backgroundImage: {
        candy: 'linear-gradient(120deg,#FF3D81 0%,#A855F7 55%,#6366F1 100%)',
        sunset: 'linear-gradient(120deg,#FF3D81 0%,#FF7A3D 50%,#FFC93C 100%)',
        aurora: 'linear-gradient(120deg,#7C3AED 0%,#2DD4BF 55%,#22D3EE 100%)',
      },
      animation: {
        'pulse-dot': 'pulseDot 1s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        pulseDot: {
          '0%,100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(0.85)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
