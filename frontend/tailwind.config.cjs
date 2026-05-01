/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8f9fa',
        foreground: '#191c1d',
        primary: {
          DEFAULT: '#212529',
          foreground: '#ffffff',
          container: '#0c1014',
          fixed: '#e0e3e8',
          fixedDim: '#c3c7cc',
          onFixed: '#181c20',
          onFixedVariant: '#43474c',
          onContainer: '#888c91',
        },
        secondary: {
          DEFAULT: '#C5A059',
          foreground: '#ffffff',
          container: '#fed488',
          fixed: '#ffdea5',
          fixedDim: '#e9c176',
          onFixed: '#261900',
          onFixedVariant: '#5d4201',
          onContainer: '#785a1a',
        },
        tertiary: {
          DEFAULT: '#E83E8C',
          foreground: '#ffffff',
          container: '#4f0029',
          fixed: '#ffd9e3',
          fixedDim: '#ffb0ca',
          onFixed: '#3e001f',
          onFixedVariant: '#8d004e',
          onContainer: '#f44895',
        },
        surface: {
          DEFAULT: '#f8f9fa',
          dim: '#d9dadb',
          bright: '#f8f9fa',
          container: '#edeeef',
          containerLow: '#f3f4f5',
          containerLowest: '#ffffff',
          containerHigh: '#e7e8e9',
          containerHighest: '#e1e3e4',
          variant: '#e1e3e4',
          tint: '#5b5f63',
        },
        onSurface: '#191c1d',
        onSurfaceVariant: '#44474a',
        inverse: {
          surface: '#2e3132',
          onSurface: '#f0f1f2',
          primary: '#c3c7cc',
        },
        outline: '#75777b',
        outlineVariant: '#c5c6ca',
        error: '#ba1a1a',
        errorContainer: '#ffdad6',
        onError: '#ffffff',
        onErrorContainer: '#93000a',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#191c1d'
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#191c1d'
        },
        muted: {
          DEFAULT: '#f3f4f5',
          foreground: '#75777b'
        },
        accent: {
          DEFAULT: '#C5A059',
          foreground: '#ffffff'
        },
        destructive: {
          DEFAULT: '#ba1a1a',
          foreground: '#ffffff'
        },
        border: '#e1e3e4',
        input: '#e1e3e4',
        ring: '#212529',
        chart: {
          '1': '#212529',
          '2': '#C5A059',
          '3': '#E83E8C',
          '4': '#44474a',
          '5': '#75777b'
        }
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
        full: '9999px'
      },
      spacing: {
        'container-max': '1280px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
        'section-gap': '80px',
        gutter: '24px',
        margin: '32px',
      },
      fontFamily: {
        'display-lg': ['Noto Serif', 'serif'],
        'display-md': ['Noto Serif', 'serif'],
        'headline-lg': ['Noto Serif', 'serif'],
        'headline-md': ['Noto Serif', 'serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'body-md': ['Inter', 'sans-serif'],
        'body-sm': ['Inter', 'sans-serif'],
        'label-lg': ['Inter', 'sans-serif'],
        'label-sm': ['Inter', 'sans-serif'],
        serif: ['Noto Serif', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['36px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-md': ['22px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '1.2', letterSpacing: '0.02em', fontWeight: '500' }],
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
