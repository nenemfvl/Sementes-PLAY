/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sementes': {
          'primary': '#10B981', // Verde principal
          'secondary': '#059669', // Verde escuro
          'accent': '#34D399', // Verde claro
          'dark': '#064E3B', // Verde muito escuro
          'light': '#D1FAE5', // Verde muito claro
        },
        'sss': {
          'dark': '#111827', // Fundo escuro
          'light': '#F9FAFB', // Fundo claro
          'accent': '#10B981', // Verde accent
          'white': '#FFFFFF', // Branco
          'gray': '#6B7280', // Cinza
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
