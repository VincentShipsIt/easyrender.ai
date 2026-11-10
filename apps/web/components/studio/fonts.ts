import localFont from 'next/font/local';

// Display and text face of the marketing pages. Variable in weight and width; headlines use the
// wider cuts.
export const monaSans = localFont({
  src: './fonts/MonaSans-latin.woff2',
  variable: '--font-mona',
  weight: '200 900',
  display: 'swap',
  declarations: [
    { prop: 'font-family', value: 'monaSans' },
    { prop: 'font-stretch', value: '75% 125%' },
  ],
});

// Data face: sizes, counts, units and the labels inside the viewports.
export const martianMono = localFont({
  src: './fonts/MartianMono-latin.woff2',
  variable: '--font-martian',
  weight: '100 800',
  display: 'swap',
  declarations: [
    { prop: 'font-family', value: 'martianMono' },
    { prop: 'font-stretch', value: '75% 112.5%' },
  ],
});
