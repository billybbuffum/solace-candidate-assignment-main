import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        solace: {
          primary: '#285c4c',
          secondary: '#1e4a3c',
          accent: '#34d399',
          light: '#f0fdf4',
          dark: '#0f2419',
          gray: '#6b7280',
        }
      },
      fontFamily: {
        'lato': ['Lato', 'system-ui', 'sans-serif'],
        'mollie': ['Mollie Glaston', 'system-ui', 'serif'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'hero-lg': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
      },
      boxShadow: {
        'solace': '0 4px 20px rgba(40, 92, 76, 0.1)',
        'solace-lg': '0 12px 40px rgba(40, 92, 76, 0.2)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-solace": "linear-gradient(135deg, #285c4c 0%, #34d399 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
