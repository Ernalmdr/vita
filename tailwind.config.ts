import type { Config } from "tailwindcss";
import { withUt } from "uploadthing/tw";

const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        congress: {
          red: '#5d0014',
          dark: '#2a0009',
          cream: '#f9f7f2',
          gold: '#d4af37',
        }
      },
      fontFamily: {
        sans: ['var(--font-lato)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default withUt(config);
