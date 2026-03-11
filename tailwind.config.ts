import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gc-black':   '#1a1a1a',
        'gc-white':   '#ffffff',
        'gc-surface': '#f1f1f1',
        'gc-border':  '#e0e0e0',
        'gc-mid':     '#888888',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        'widest-2': '0.3em',
        'widest-3': '0.35em',
      },
    },
  },
  plugins: [],
}

export default config
