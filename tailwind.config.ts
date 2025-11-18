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
        // Primary Brand Colors
        'nocturne-black': '#110418',
        'ink-depth': '#10030A',
        'midnight-blue': '#102940',
        
        // Secondary Brand Colors
        'plum-shade': '#5A4355',
        'muted-mauve': '#887878',
        
        // Dark Neutrals (Structure, Cards, UI strokes)
        'charcoal': '#181818',
        'onyx': '#282828',
        'cold-graphite': '#474048',
        'gunmetal-fade': '#504748',
        
        // Light Neutrals (Readable text, subtle contrast blocks)
        'soft-bone-grey': '#BFB8B9',
        'dust-linen': '#B8B1A1',
        'warm-ash': '#A79496',
        
        // Semantic mappings for easy use
        background: {
          DEFAULT: '#110418', // nocturne-black
          elevated: '#282828', // onyx
          card: '#474048', // cold-graphite
          section: '#181818', // charcoal
        },
        text: {
          DEFAULT: '#BFB8B9', // soft-bone-grey
          muted: '#887878', // muted-mauve
          secondary: '#A79496', // warm-ash
          header: '#B8B1A1', // dust-linen
        },
        primary: {
          DEFAULT: '#5A4355', // plum-shade
          hover: '#10030A', // ink-depth
        },
        border: '#504748', // gunmetal-fade
        accent: '#B8B1A1', // dust-linen
        danger: '#10030A', // ink-depth
        divider: '#282828', // onyx
      },
    },
  },
  plugins: [],
}
export default config
