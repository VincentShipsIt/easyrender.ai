# Geist subsets

`Geist-latin.woff2` and `GeistMono-latin.woff2` are the variable Geist Sans and Geist Mono from
the `geist` package (1.9.2), subset for the languages the site serves (en, es, de, fr, it, pt)
and limited to the weights it uses (400 to 700). Copyright (c) 2023 Vercel, in collaboration with
basement.studio, licensed under the SIL Open Font License 1.1 (no reserved font name):
https://openfontlicense.org. The full licence ships in `node_modules/geist/LICENSE.txt`.

Characters kept: U+0000-017F, U+0218-021B, U+02BB-02BC, U+02C6, U+02DA, U+02DC, the combining
grave, acute, tilde, macron, diaeresis, ring, caron and cedilla (U+0300-0301, U+0303-0304,
U+0308, U+030A, U+030C, U+0327), U+1E9E, U+2000-206F, U+20A0-20CF, U+2100-214F,
U+2190-21FF, U+2200-22FF, U+2500-257F, U+25A0-25FF, U+2713-2714, U+FB01-FB02. A character outside
that set falls back to the next font in the stack, as it already did for anything Geist lacks.

To rebuild them (fontTools 4.62 with brotli), from `apps/web`:

```sh
U="U+0000-00FF,U+0100-017F,U+0218-021B,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0300-0301,U+0303-0304,U+0308,U+030A,U+030C,U+0327,U+1E9E,U+2000-206F,U+20A0-20CF,U+2100-214F,U+2190-21FF,U+2200-22FF,U+2500-257F,U+25A0-25FF,U+2713-2714,U+FB01-FB02"
G=node_modules/geist/dist/fonts
for f in geist-sans/Geist-Variable:Geist-latin geist-mono/GeistMono-Variable:GeistMono-latin; do
  pyftsubset "$G/${f%%:*}.woff2" --unicodes="$U" --layout-features='*' --flavor=woff2 --output-file=/tmp/${f##*:}.woff2
  fonttools varLib.instancer /tmp/${f##*:}.woff2 wght=400:700 -o lib/font-files/${f##*:}.woff2
done
```

Before using a new weight (300, 800) or a script outside Latin, rebuild with a wider range.
