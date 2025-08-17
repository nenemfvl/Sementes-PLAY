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
          'secondary': '#4A235A', // Roxo escuro (início do degradê)
          'accent': '#7B3F8D', // Roxo mais claro (fim do degradê)
          'dark': '#0A0A1A', // Azul muito escuro (fundo principal)
          'light': '#FFD700', // Dourado (ícones de presente)
        },
        'sss': {
          'dark': '#0A0A1A', // Azul muito escuro (navbar e fundo)
          'light': '#FFFFFF', // Branco
          'accent': '#FF0000', // Vermelho puro
          'white': '#FFFFFF', // Branco
          'gray': '#2C2C3A', // Cinza azulado (botões secundários)
          'darker': '#0A0A1A', // Mesmo azul escuro
          'medium': '#0A0A1A', // Mesmo azul escuro
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
