import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090416', // Deep Midnight Purple
        panel: '#110825', // Frosted Panel dark purple
        emerald: {
          dark: '#05020c',
          base: '#13092b',
          light: '#221245',
        },
        cyan: {
          electric: '#8B5CF6', // GenAI Spark Purple
        },
        indigo: {
          royal: '#4F46E5', // Royal Indigo
        },
        mint: {
          aurora: '#06B6D4', // Predictive Teal
        },
        lime: {
          neon: '#10B981', // Pitch Green
        },
        gold: {
          solar: '#F59E0B', // Gold Honor
        },
        orange: {
          cyber: '#F97316', // High Capacity / Transit Delay
        },
        flow: {
          optimal: '#22C55E', // Green Optimal Flow
          delay: '#F97316', // Orange High Capacity
          critical: '#EF4444', // Red Critical Bottleneck
        }
      },
      fontFamily: {
        sans: ['Inter', 'Satoshi', 'General Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
