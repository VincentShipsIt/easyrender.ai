import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { defineDiagram, LINE, SHAPE, SOFT, Tag } from './kit';

// Guide: sell-vintage-furniture-online.

// Small pictograms of a chest of drawers, one per shot. Drawn in a 64-unit box.
const PICTOS: Record<string, ReactNode> = {
  front: (
    <>
      <rect x={12} y={12} width={40} height={36} rx={2} className={SHAPE} strokeWidth={2} />
      <line x1={12} y1={30} x2={52} y2={30} className={LINE} strokeWidth={2} />
      <line x1={16} y1={48} x2={16} y2={54} className={LINE} strokeWidth={2.5} />
      <line x1={48} y1={48} x2={48} y2={54} className={LINE} strokeWidth={2.5} />
    </>
  ),
  threeQuarter: (
    <>
      <path d="M8 18 L36 22 L36 50 L8 46 Z" className={SHAPE} strokeWidth={2} />
      <path
        d="M36 22 L56 15 L56 42 L36 50 Z"
        className="fill-background stroke-foreground"
        strokeWidth={2}
      />
      <path
        d="M8 18 L28 12 L56 15 L36 22 Z"
        className="fill-background stroke-foreground"
        strokeWidth={2}
      />
      <line x1={8} y1={32} x2={36} y2={36} className={LINE} strokeWidth={2} />
    </>
  ),
  side: (
    <>
      <rect x={22} y={12} width={20} height={36} rx={2} className={SHAPE} strokeWidth={2} />
      <line x1={25} y1={48} x2={25} y2={54} className={LINE} strokeWidth={2.5} />
      <line x1={39} y1={48} x2={39} y2={54} className={LINE} strokeWidth={2.5} />
    </>
  ),
  back: (
    <>
      <rect
        x={12}
        y={12}
        width={40}
        height={36}
        rx={2}
        className="fill-background stroke-foreground"
        strokeWidth={2}
      />
      <line x1={25} y1={12} x2={25} y2={48} className={SOFT} strokeWidth={1.5} />
      <line x1={39} y1={12} x2={39} y2={48} className={SOFT} strokeWidth={1.5} />
    </>
  ),
  drawer: (
    <>
      <path d="M10 26 L54 26 L54 48 L10 48 Z" className={SHAPE} strokeWidth={2} />
      <path d="M14 26 L20 14 L44 14 L50 26" className={LINE} strokeWidth={2} />
      <line x1={18} y1={38} x2={46} y2={38} className={SOFT} strokeWidth={1.5} />
    </>
  ),
  label: (
    <>
      <rect x={10} y={16} width={44} height={30} rx={2} className={SHAPE} strokeWidth={2} />
      <rect
        x={20}
        y={24}
        width={24}
        height={12}
        rx={1}
        className="fill-background stroke-foreground"
        strokeWidth={1.5}
      />
    </>
  ),
  flaw: (
    <>
      <rect x={6} y={6} width={52} height={52} rx={2} className={SHAPE} strokeWidth={2} />
      <circle cx={30} cy={30} r={13} className={LINE} strokeWidth={2} strokeDasharray="5 3" />
      <circle cx={30} cy={30} r={9} className={SOFT} strokeWidth={1.5} />
    </>
  ),
  joint: (
    <>
      <path d="M12 14 L36 14 L36 38 L52 38 L52 52 L12 52 Z" className={SHAPE} strokeWidth={2} />
      <path d="M30 14 L36 20 L30 26 L36 32 L30 38" className={LINE} strokeWidth={2} />
    </>
  ),
};

/** The photo set for a one-off piece: every side, inside every drawer, then each flaw close up. */
export const vintageShotList = defineDiagram(
  {
    en: {
      shots: [
        { picto: 'front', title: 'Front' },
        { picto: 'threeQuarter', title: 'Three-quarter' },
        { picto: 'side', title: 'Side' },
        { picto: 'back', title: 'Back' },
        { picto: 'drawer', title: 'Inside every drawer' },
        { picto: 'label', title: 'Maker’s label or stamp' },
        { picto: 'joint', title: 'Joints and repairs' },
        { picto: 'flaw', title: 'Each flaw, close up', isKey: true },
      ],
      note: 'Shot 8 is the one that heads off a dispute after delivery.',
    },
    de: {
      shots: [
        { picto: 'front', title: 'Vorne' },
        { picto: 'threeQuarter', title: 'Dreiviertel' },
        { picto: 'side', title: 'Seite' },
        { picto: 'back', title: 'Hinten' },
        { picto: 'drawer', title: 'Jede Schublade innen' },
        { picto: 'label', title: 'Etikett oder Stempel' },
        { picto: 'joint', title: 'Verbindungen, Reparaturen' },
        { picto: 'flaw', title: 'Jeder Mangel aus der Nähe', isKey: true },
      ],
      note: 'Foto 8 verhindert Streit nach der Lieferung.',
    },
    fr: {
      shots: [
        {
          picto: 'front',
          title: 'Face',
        },
        {
          picto: 'threeQuarter',
          title: 'Trois quarts',
        },
        {
          picto: 'side',
          title: 'Côté',
        },
        {
          picto: 'back',
          title: 'Dos',
        },
        {
          picto: 'drawer',
          title: 'Intérieur de chaque tiroir',
        },
        {
          picto: 'label',
          title: 'Étiquette ou estampille',
        },
        {
          picto: 'joint',
          title: 'Assemblages et réparations',
        },
        {
          picto: 'flaw',
          title: 'Chaque défaut en gros plan',
          isKey: true,
        },
      ],
      note: 'La photo 8 évite une contestation après la livraison.',
    },
    it: {
      shots: [
        {
          picto: 'front',
          title: 'Fronte',
        },
        {
          picto: 'threeQuarter',
          title: 'Tre quarti',
        },
        {
          picto: 'side',
          title: 'Lato',
        },
        {
          picto: 'back',
          title: 'Retro',
        },
        {
          picto: 'drawer',
          title: 'Interno di ogni cassetto',
        },
        {
          picto: 'label',
          title: 'Etichetta o marchio',
        },
        {
          picto: 'joint',
          title: 'Giunti e riparazioni',
        },
        {
          picto: 'flaw',
          title: 'Ogni difetto da vicino',
          isKey: true,
        },
      ],
      note: 'La foto 8 evita contestazioni dopo la consegna.',
    },
    pt: {
      shots: [
        {
          picto: 'front',
          title: 'Frente',
        },
        {
          picto: 'threeQuarter',
          title: 'Três quartos',
        },
        {
          picto: 'side',
          title: 'Lado',
        },
        {
          picto: 'back',
          title: 'Costas',
        },
        {
          picto: 'drawer',
          title: 'Interior de cada gaveta',
        },
        {
          picto: 'label',
          title: 'Etiqueta ou marca',
        },
        {
          picto: 'joint',
          title: 'Encaixes e reparações',
        },
        {
          picto: 'flaw',
          title: 'Cada defeito em pormenor',
          isKey: true,
        },
      ],
      note: 'A foto 8 evita reclamações após a entrega.',
    },
  },
  function VintageShotList({ t }) {
    return (
      <div className="space-y-3">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {t.shots.map((shot, index) => (
            <li
              key={shot.picto}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-md border bg-background p-2 text-center',
                'isKey' in shot && shot.isKey && 'border-foreground/60',
              )}
            >
              <svg viewBox="0 0 64 64" className="size-12" aria-hidden>
                {PICTOS[shot.picto]}
              </svg>
              <span className="flex items-center gap-1.5 text-xs font-medium leading-snug">
                <Tag>{index + 1}</Tag>
                {shot.title}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground">{t.note}</p>
      </div>
    );
  },
);

/** A listing title split into the parts buyers type, next to one with none of them. */
export const listingTitle = defineDiagram(
  {
    en: {
      good: [
        { word: 'Ercol', part: 'Maker' },
        { word: 'elm', part: 'Material' },
        { word: 'Windsor', part: 'Style' },
        { word: 'dining chair,', part: 'Object' },
        { word: '1960s', part: 'Era' },
      ],
      weak: 'Lovely old chair',
      weakNote: 'No maker, material, style or era: nothing a buyer searches for.',
      goodLabel: 'Found',
      weakLabel: 'Missed',
    },
    de: {
      good: [
        { word: 'Ercol', part: 'Hersteller' },
        { word: 'Ulme', part: 'Material' },
        { word: 'Windsor', part: 'Stil' },
        { word: 'Esszimmerstuhl,', part: 'Gegenstand' },
        { word: '1960er', part: 'Epoche' },
      ],
      weak: 'Schöner alter Stuhl',
      weakNote: 'Ohne Hersteller, Material, Stil oder Epoche fehlen Suchbegriffe.',
      goodLabel: 'Gefunden',
      weakLabel: 'Übersehen',
    },
    fr: {
      good: [
        {
          word: 'Ercol',
          part: 'Fabricant',
        },
        {
          word: 'orme',
          part: 'Matériau',
        },
        {
          word: 'Windsor',
          part: 'Style',
        },
        {
          word: 'chaise de salle à manger,',
          part: 'Objet',
        },
        {
          word: 'années 1960',
          part: 'Époque',
        },
      ],
      weak: 'Jolie chaise ancienne',
      weakNote: 'Sans fabricant, matériau, style ni époque : aucun terme recherché.',
      goodLabel: 'Trouvée',
      weakLabel: 'Introuvable',
    },
    it: {
      good: [
        { word: 'Sedia da pranzo', part: 'Oggetto' },
        { word: 'Ercol', part: 'Produttore' },
        { word: 'Windsor', part: 'Stile' },
        { word: 'in olmo,', part: 'Materiale' },
        { word: 'anni 1960', part: 'Epoca' },
      ],
      weak: 'Bella sedia vecchia',
      weakNote: 'Niente produttore, materiale, stile o epoca: nessun termine cercato.',
      goodLabel: 'Trovata',
      weakLabel: 'Non trovata',
    },
    pt: {
      good: [
        { word: 'Cadeira de jantar', part: 'Objeto' },
        { word: 'Ercol', part: 'Fabricante' },
        { word: 'Windsor', part: 'Estilo' },
        { word: 'em olmo,', part: 'Material' },
        { word: 'anos 1960', part: 'Época' },
      ],
      weak: 'Cadeira antiga bonita',
      weakNote: 'Sem fabricante, material, estilo ou época: faltam termos de pesquisa.',
      goodLabel: 'Encontrada',
      weakLabel: 'Não encontrada',
    },
  },
  function ListingTitle({ t }) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Tag className="text-foreground">{t.goodLabel}</Tag>
          <p className="flex flex-wrap gap-x-2 gap-y-3">
            {t.good.map((item) => (
              <span key={item.part} className="inline-flex flex-col items-start">
                <span className="rounded-md border border-foreground/60 bg-background px-2 py-1 text-base font-medium">
                  {item.word}
                </span>
                <span className="mt-1 pl-1 text-xs text-muted-foreground">{item.part}</span>
              </span>
            ))}
          </p>
        </div>
        <div className="space-y-2">
          <Tag>{t.weakLabel}</Tag>
          <p>
            <span className="rounded-md border border-dashed bg-background px-2 py-1 text-base text-muted-foreground">
              {t.weak}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">{t.weakNote}</p>
        </div>
      </div>
    );
  },
);
