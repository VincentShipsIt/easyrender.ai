// Render skills: per-category guidance that is added to the turnaround prompt. Each one encodes
// what goes wrong for that kind of product (invented details, lost reflections, flattened
// materials) and tells the model to keep what the photo shows. Plain data on purpose, so a skill
// is a few lines to add and can be moved to a private package without touching the pipeline.

export type RenderSkill = {
  id: string;
  label: string;
  // Matched against the product name and the user's note, English and Spanish.
  keywords: string[];
  guidance: string;
};

export const DEFAULT_SKILL: RenderSkill = {
  id: 'general',
  label: 'General product',
  keywords: [],
  guidance:
    'Treat the photo as the single source of truth. Where a view is hidden in the photo, infer it conservatively from visible symmetry and construction; never invent logos, text, ports, buttons or decoration.',
};

export const SKILLS: RenderSkill[] = [
  {
    id: 'furniture',
    label: 'Furniture and home',
    keywords: [
      'chair',
      'sofa',
      'couch',
      'armchair',
      'table',
      'desk',
      'bench',
      'stool',
      'bed',
      'shelf',
      'cabinet',
      'lamp',
      'rug',
      'silla',
      'sillon',
      'sillón',
      'mesa',
      'escritorio',
      'banco',
      'cama',
      'estanteria',
      'estantería',
      'lampara',
      'lámpara',
      'alfombra',
    ],
    guidance:
      'This is furniture or a home object. Keep the exact number and shape of legs, arms, cushions and drawers. Preserve upholstery weave, wood grain direction and seams, and keep real-world proportions (seat height, depth) identical in every view. Keep every part physically makeable from its material: stone is cut or carved and never bent, tube bends in smooth arcs, solid wood follows its grain, upholstery sits over a frame.',
  },
  {
    id: 'jewelry',
    label: 'Jewelry and watches',
    keywords: [
      'ring',
      'necklace',
      'bracelet',
      'earring',
      'watch',
      'pendant',
      'jewel',
      'anillo',
      'collar',
      'pulsera',
      'pendiente',
      'reloj',
      'joya',
    ],
    guidance:
      'This is jewelry or a watch: small, reflective and detailed. Keep the exact stone count, stone cut, metal colour and finish, chain links and clasp. Show reflections that match soft studio light and never add engravings, hallmarks or text that are not in the photo.',
  },
  {
    id: 'apparel',
    label: 'Apparel and footwear',
    keywords: [
      'shoe',
      'sneaker',
      'boot',
      'jacket',
      'shirt',
      'hoodie',
      'dress',
      'hat',
      'cap',
      'zapato',
      'zapatilla',
      'bota',
      'chaqueta',
      'camiseta',
      'sudadera',
      'vestido',
      'gorra',
    ],
    guidance:
      'This is apparel or footwear shown as a three-dimensional object with its natural volume, not laid flat. Keep stitching, panel seams, laces, soles, zippers, fabric texture and any print exactly as in the photo. No model, mannequin or hands.',
  },
  {
    id: 'bags',
    label: 'Bags and leather goods',
    keywords: [
      'bag',
      'backpack',
      'wallet',
      'purse',
      'handbag',
      'suitcase',
      'bolso',
      'mochila',
      'cartera',
      'maleta',
      'billetera',
    ],
    guidance:
      'This is a bag or leather good. Keep the leather grain, stitching, hardware finish, strap and handle shape, pockets and closures. Show the object in its natural filled shape and do not invent branding or interior detail.',
  },
  {
    id: 'electronics',
    label: 'Electronics',
    keywords: [
      'phone',
      'laptop',
      'speaker',
      'headphone',
      'camera',
      'keyboard',
      'console',
      'charger',
      'tablet',
      'movil',
      'móvil',
      'portatil',
      'portátil',
      'altavoz',
      'auricular',
      'camara',
      'cámara',
      'teclado',
      'cargador',
    ],
    guidance:
      'This is an electronic device. Keep every port, button, vent, seam and camera lens where the photo shows it, with a plain dark or neutral blank screen and no invented UI, logos or text. Hidden sides get only generic, unmarked surfaces.',
  },
  {
    id: 'glass',
    label: 'Glass and bottles',
    keywords: [
      'glass',
      'bottle',
      'vase',
      'jar',
      'cup',
      'mug',
      'perfume',
      'vaso',
      'botella',
      'jarron',
      'jarrón',
      'taza',
      'frasco',
    ],
    guidance:
      'This is glass, ceramic or a bottle. Keep transparency, liquid level, thickness and the exact label position and artwork. Use soft edge definition so a clear object reads against the white background; no extra caustics or coloured reflections.',
  },
];

const normalise = (text: string) => text.toLowerCase();

// Picks the skill whose keywords appear most often in the name and note; the general skill otherwise.
export function selectSkillFrom(
  skills: RenderSkill[],
  ...texts: (string | null | undefined)[]
): RenderSkill {
  const haystack = normalise(texts.filter(Boolean).join(' '));
  if (!haystack) return DEFAULT_SKILL;
  let best: { skill: RenderSkill; hits: number } | null = null;
  for (const skill of skills) {
    const hits = skill.keywords.filter((keyword) =>
      new RegExp(`(^|[^\\p{L}])${keyword}`, 'u').test(haystack),
    ).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { skill, hits };
  }
  return best?.skill ?? DEFAULT_SKILL;
}

export const selectSkill = (...texts: (string | null | undefined)[]) =>
  selectSkillFrom(SKILLS, ...texts);
