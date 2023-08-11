/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '821px',
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          lg: '2rem',
        },
      },
      colors: {
        primary: '#111',
        secondary: '#0070f3',
        black: '#000',
        white: '#fff',
      },
      spacing: {
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      boxShadow: {
        white: '0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)',
        custom: '0 10px 15px -3px rgba(0, 0, 0, 0.75), 0 4px 6px -2px rgba(0, 0, 0, 0.75)',
      }
    },
  },
  plugins: [require('@headlessui/tailwindcss')({ prefix: 'ui' })],
};
