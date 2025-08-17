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
          'primary': '#FF6B6B', // Vermelho/rosa vibrante (cor principal)
          'secondary': '#4A235A', // Roxo escuro
          'accent': '#7B3F8D', // Roxo mais claro
          'dark': '#1A1A2E', // Azul índigo escuro (fundo principal)
          'light': '#ADD8E6', // Azul claro (ícones)
        },
        'sss': {
          'dark': '#0A0A1A', // Azul muito escuro (navbar)
          'light': '#FFFFFF', // Branco
          'accent': '#FF6B6B', // Vermelho/rosa vibrante
          'white': '#FFFFFF', // Branco
          'gray': '#2C2C3A', // Cinza azulado (botões secundários)
          'darker': '#121220', // Azul escuro (seção inferior)
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
