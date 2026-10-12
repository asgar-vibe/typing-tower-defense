/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#080c14',
          card: '#0f172a',
          border: '#1e293b',
          cyan: '#00f0ff',
          neonPink: '#ff007f',
          neonGreen: '#00ff66',
          amber: '#ffaa00',
          crimson: '#ff2a55',
          violet: '#a855f7',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Orbitron"', 'sans-serif'],
        tech: ['"Rajdhani"', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 15px rgba(0, 240, 255, 0.5), 0 0 30px rgba(0, 240, 255, 0.2)',
        'crimson-glow': '0 0 15px rgba(255, 42, 85, 0.5), 0 0 30px rgba(255, 42, 85, 0.2)',
        'amber-glow': '0 0 15px rgba(255, 170, 0, 0.5), 0 0 30px rgba(255, 170, 0, 0.2)',
        'green-glow': '0 0 15px rgba(0, 255, 102, 0.5), 0 0 30px rgba(0, 255, 102, 0.2)',
        'violet-glow': '0 0 15px rgba(168, 85, 247, 0.5), 0 0 30px rgba(168, 85, 247, 0.2)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'laser': 'laser 0.15s ease-out forwards',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
