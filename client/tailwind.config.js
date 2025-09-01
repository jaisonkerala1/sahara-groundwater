/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          purple: '#4A148C',
          purpleLight: '#6A1B9A',
          purpleDark: '#311B92',
        },
        secondary: {
          red: '#E53935',
          redLight: '#EF5350',
          redDark: '#C62828',
          yellow: '#FFC107',
          yellowLight: '#FFEB3B',
          yellowDark: '#FF8F00',
        },
        neutral: {
          white: '#FFFFFF',
          gray50: '#FAFAFA',
          gray100: '#F5F5F5',
          gray200: '#EEEEEE',
          gray300: '#E0E0E0',
          gray400: '#BDBDBD',
          gray500: '#9E9E9E',
          gray700: '#616161',
          gray900: '#212121',
          black: '#000000',
        },
        status: {
          success: '#4CAF50',
          error: '#F44336',
          info: '#2196F3',
          heart: '#E91E63',
        },
        chart: {
          purple: '#4A148C',
          red: '#E53935',
          yellow: '#FFC107',
          green: '#059669',
          blue: '#2563EB',
        }
      },
      fontFamily: {
        primary: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        secondary: ['SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'h1': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['28px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body1': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body2': ['14px', { lineHeight: '1.4', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.3', fontWeight: '400' }],
        'number': ['48px', { lineHeight: '1.1', fontWeight: '700' }],
        'metric': ['20px', { lineHeight: '1.2', fontWeight: '600' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'card': '16px',
        'button': '12px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'floating': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
