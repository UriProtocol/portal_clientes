import { Manrope, IBM_Plex_Sans, Roboto, Inter } from 'next/font/google'

export const roboto = Roboto({
  subsets: ['latin'], 
  weight: '400',  
  display: "swap",
  adjustFontFallback: false,
  fallback: ['system-ui', 'arial']
})

export const manrope = Manrope({
  subsets: ['latin'], 
  variable: '--font-manrope',  
  display: "swap",
  adjustFontFallback: false,
  fallback: ['system-ui', 'sans-serif']
})

export const ibmPlexSans = IBM_Plex_Sans({
  weight: '500', 
  subsets: ['latin'],  
  display: "swap",
  adjustFontFallback: false,
  fallback: ['system-ui', 'arial']
})


export const inter = Inter({
  weight: '600', 
  subsets: ['latin'],  
  display: "swap",
  adjustFontFallback: false,
  fallback: ['system-ui', 'arial']
})