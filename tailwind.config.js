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
          'primary': '#FF0000', // Vermelho puro (cor principal)
          'secondary': '#CC0000', // Vermelho escuro
          'accent': '#FF3333', // Vermelho mais claro
          'dark': '#0A0A1A', // Azul muito escuro (fundo principal)
          'light': '#FFD700', // Dourado (ícones de presente)
        },
        'sss': {
          'dark': '#0A0A1A', // Azul muito escuro (navbar)
          'light': '#FFFFFF', // Branco
          'accent': '#FF0000', // Vermelho puro
          'white': '#FFFFFF', // Branco
          'gray': '#2C2C3A', // Cinza azulado (botões secundários)
          'darker': '#121220', // Azul escuro (seção inferior)
          'medium': '#1A1A2E', // Azul médio (seção central)
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
