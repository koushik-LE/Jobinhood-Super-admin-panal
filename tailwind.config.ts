import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const defaultTheme = require('tailwindcss/defaultTheme');

const colors = require('tailwindcss/colors');
const { default: flattenColorPalette } = require('tailwindcss/lib/util/flattenColorPalette');

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      boxShadow: {
        custom_card: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23) !important',
        light_custom_card: '0 4px 6px rgba(255, 255, 255, 0.5) !important',
        'light-bottom': '0 2px 4px rgba(0, 0, 0, 0.1) !important',
        'dark-bottom': '0 2px 4px rgba(255, 255, 255, 0.4) !important',
        'light-top': '0 -2px 4px rgba(0, 0, 0, 0.1)',
        'dark-top': '0 -2px 4px rgba(255, 255, 255, 0.4)',
        // Brand glow (Purple → MainGradient)
        'brand-glow': '0 0 25px rgba(240, 42, 243, 0.35)',
        'brand-glow-lg': '0 0 45px rgba(240, 42, 243, 0.4)',
        'card-dark': '0 8px 30px rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        // MainGradient color style: Purple -> Violet
        'theme-brand': 'linear-gradient(90deg, #F02AF3 0%, #4D13E3 100%)',
        // Left hero panel gradient (bg -> card tone)
        'theme-hero': 'linear-gradient(180deg, #0d0d14 0%, #1a0f2e 100%)',
        // Full-page dark background
        'theme-app': 'linear-gradient(180deg, #0a0a0f 0%, #14101f 100%)',
      },
      colors: {
        // --- Figma "Color styles" mapped 1:1 ---
        brand: {
          DEFAULT: '#F02AF3', // Purple
          violet: '#4D13E3', // Violet
          dark: '#4D13E3', // alias kept for existing usages (brand.dark)
          gradientFrom: '#F02AF3', // MainGradient start
          gradientTo: '#4D13E3', // MainGradient end
        },

        surface: {
          DEFAULT: '#0A0A0F', // MainBgColor
          card: '#14142B', // CardColor
          cardBorder: 'rgba(255,255,255,0.08)',
          input: 'rgba(255,255,255,0.03)',
          inputBorder: 'rgba(255,255,255,0.10)',
        },

        // Status / accent colors from the Figma panel
        statusGreen: { DEFAULT: '#34B27A', bg: 'rgba(52,178,122,0.15)' }, // Green + Chip Green Bg
        statusAmber: { DEFAULT: '#E39A3D', bg: 'rgba(227,154,61,0.15)' }, // Amber
        statusRed: { DEFAULT: '#DE5A5A', light: '#7A3A38', bg: 'rgba(222,90,90,0.15)' }, // Red + Red light
        statusBlue: { DEFAULT: '#4C7EF3', bg: 'rgba(76,126,243,0.15)' }, // Blue
        statusGrey: { DEFAULT: '#9AA3B8', bg: 'rgba(154,163,184,0.15)' }, // Grey

        // Text tokens (TextMain / SecondryText)
        textMain: '#FFFFFF',
        textSecondary: '#C7C9D9',
        textMuted: '#8A8FA3',

        // Border color style
        borderColor: '#33344B',

        // --- Legacy custom colors kept for backward compatibility ---
        blue10: '#073071',
        blue20: '#151D48',
        blue30: '#EBF6FF',
        blue40: '#1E2A47',
        blue50: '#4050E7',
        blue60: '#EBF5FF',
        blue70: '#0D5BD7',
        blue80: '#052963',
        blue90: '#C2E7FE',
        blue100: '#01337A',
        blue110: '#052658',
        blue120: '#17334D',
        blue130: '#10263D',
        blue140: '#1E3A8A',
        blue150: '#E9EEF6',
        blue160: '#344054',

        black10: '#000000',
        black20: '#1E1E1E',
        black30: '#1C1B1F',

        white10: '#FFFFFF',
        white20: '#F8F8FF',
        white30: '#F8FAFD',

        red10: '#eb5757',
        red20: '#FF9090',
        red30: '#DC2626',

        orange10: '#ffa412',

        gray10: '#2D3748',
        gray20: '#74788d',
        gray30: '#d8d6cf',
        gray40: '#D8D8D8',
        gray50: '#EAEAEC',
        gray60: '#CECECE',
        gray70: '#2A2A2A',
        gray80: '#5E5E5E',
        gray90: '#d2d7dc',
        gray100: '#ABABAB',
        gray110: '#DADADA',
        darkgray10: '#4E4E4E',

        amber10: '#d7940d',

        brown10: '#5C4033',

        // Existing shadcn/ui token definitions
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      fontFamily: {
        poppins: ['Poppins'],
      },
    },
  },
  plugins: [tailwindcssAnimate, addVariablesForColors],
} satisfies Config;

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme('colors'));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ':root': newVars,
  });
}
export default config;
