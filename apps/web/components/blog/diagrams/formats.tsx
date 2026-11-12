import {
  Archive,
  FileBox,
  FileCode2,
  Image,
  MessageSquare,
  Monitor,
  Smartphone,
  View,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { defineDiagram, FlowArrow, Heading, Node, Tag } from './kit';

// Guides: glb-file and usdz-file.

// The parts of /showcase/clay-vase.glb, read from the file itself (its 12-byte header, the JSON
// chunk and the BIN chunk's buffer views). Bytes, so the bar is drawn to the file's real proportions.
export const CLAY_VASE_GLB = {
  total: 308_448,
  json: 1_404,
  indices: 87_540,
  vertices: 168_120,
  texture: 51_354,
} as const;

const kb = (bytes: number) => `${(bytes / 1024).toFixed(bytes < 10_240 ? 1 : 0)} KB`;

/** What one real GLB holds, drawn in proportion to its bytes, next to the same model as loose glTF files. */
export const glbAnatomy = defineDiagram(
  {
    en: {
      file: 'clay-vase.glb',
      parts: {
        json: { title: 'JSON chunk', note: 'Scene, mesh, material: the description' },
        indices: { title: 'Triangles', note: 'Which vertices form each face' },
        vertices: { title: 'Vertices', note: 'Positions and texture coordinates' },
        texture: { title: 'Texture', note: 'One 1024 px WebP image' },
      },
      bin: 'BIN chunk: the binary data',
      gltf: 'The same model as glTF',
      gltfFiles: ['clay-vase.gltf', 'clay-vase.bin', 'texture.webp'],
      gltfNote: 'Three files that only work while they stay together.',
    },
    de: {
      file: 'clay-vase.glb',
      parts: {
        json: { title: 'JSON-Block', note: 'Beschreibt Szene, Mesh und Material' },
        indices: { title: 'Dreiecke', note: 'Welche Eckpunkte eine Fläche bilden' },
        vertices: { title: 'Eckpunkte', note: 'Positionen und Texturkoordinaten' },
        texture: { title: 'Textur', note: 'Ein WebP-Bild mit 1024 px' },
      },
      bin: 'BIN-Block: die Binärdaten',
      gltf: 'Dasselbe Modell als glTF',
      gltfFiles: ['clay-vase.gltf', 'clay-vase.bin', 'texture.webp'],
      gltfNote: 'Drei Dateien, die zusammenbleiben müssen.',
    },
    fr: {
      file: 'clay-vase.glb',
      parts: {
        json: {
          title: 'Bloc JSON',
          note: 'Description de la scène, du maillage et du matériau',
        },
        indices: {
          title: 'Triangles',
          note: 'Les sommets de chaque face',
        },
        vertices: {
          title: 'Sommets',
          note: 'Positions et coordonnées de texture',
        },
        texture: {
          title: 'Texture',
          note: 'Une image WebP de 1024 px',
        },
      },
      bin: 'Bloc BIN : les données binaires',
      gltf: 'Le même modèle en glTF',
      gltfFiles: ['clay-vase.gltf', 'clay-vase.bin', 'texture.webp'],
      gltfNote: 'Trois fichiers à garder ensemble pour que le modèle fonctionne.',
    },
    it: {
      file: 'clay-vase.glb',
      parts: {
        json: {
          title: 'Blocco JSON',
          note: 'Descrizione di scena, mesh e materiale',
        },
        indices: {
          title: 'Triangoli',
          note: 'Quali vertici formano ogni faccia',
        },
        vertices: {
          title: 'Vertici',
          note: 'Posizioni e coordinate della texture',
        },
        texture: {
          title: 'Texture',
          note: 'Un’immagine WebP da 1024 px',
        },
      },
      bin: 'Blocco BIN: i dati binari',
      gltf: 'Lo stesso modello in glTF',
      gltfFiles: ['clay-vase.gltf', 'clay-vase.bin', 'texture.webp'],
      gltfNote: 'Tre file che funzionano solo se restano insieme.',
    },
    pt: {
      file: 'clay-vase.glb',
      parts: {
        json: {
          title: 'Bloco JSON',
          note: 'Descrição da cena, malha e material',
        },
        indices: {
          title: 'Triângulos',
          note: 'Os vértices de cada face',
        },
        vertices: {
          title: 'Vértices',
          note: 'Posições e coordenadas de textura',
        },
        texture: {
          title: 'Textura',
          note: 'Uma imagem WebP de 1024 px',
        },
      },
      bin: 'Bloco BIN: os dados binários',
      gltf: 'O mesmo modelo em glTF',
      gltfFiles: ['clay-vase.gltf', 'clay-vase.bin', 'texture.webp'],
      gltfNote: 'Três ficheiros que só funcionam em conjunto.',
    },
  },
  function GlbAnatomy({ t }) {
    const parts = [
      { key: 'json', bytes: CLAY_VASE_GLB.json, icon: FileCode2, ...t.parts.json },
      { key: 'indices', bytes: CLAY_VASE_GLB.indices, icon: FileBox, ...t.parts.indices },
      { key: 'vertices', bytes: CLAY_VASE_GLB.vertices, icon: FileBox, ...t.parts.vertices },
      { key: 'texture', bytes: CLAY_VASE_GLB.texture, icon: Image, ...t.parts.texture },
    ];
    const shades = ['bg-foreground', 'bg-foreground/55', 'bg-foreground/35', 'bg-foreground/15'];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Tag className="text-foreground">{t.file}</Tag>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {kb(CLAY_VASE_GLB.total)}
          </span>
        </div>
        {/* One bar, each part as wide as its share of the file's bytes. */}
        <div className="flex h-8 overflow-hidden rounded-md border">
          {parts.map((part, index) => (
            <div
              key={part.key}
              className={cn('h-full min-w-1', shades[index])}
              style={{ width: `${(part.bytes / CLAY_VASE_GLB.total) * 100}%` }}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t.bin}</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {parts.map((part, index) => (
            <li key={part.key} className="flex items-start gap-2">
              <span className={cn('mt-1 size-3 shrink-0 rounded-sm border', shades[index])} />
              <span className="min-w-0 text-sm leading-snug">
                <span className="font-medium">{part.title}</span>{' '}
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {kb(part.bytes)}
                </span>
                <span className="block text-xs text-muted-foreground">{part.note}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="rounded-md border border-dashed p-3">
          <Heading>{t.gltf}</Heading>
          <div className="mt-2 flex flex-wrap gap-2">
            {t.gltfFiles.map((name) => (
              <Tag key={name}>{name}</Tag>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t.gltfNote}</p>
        </div>
      </div>
    );
  },
);

/** A USDZ: a zip stored without compression, holding a USD layer and the images it uses. */
export const usdzAnatomy = defineDiagram(
  {
    en: {
      file: 'side-table.usdz',
      zip: 'Zip archive, stored with zero compression',
      layer: {
        title: 'USD layer',
        note: '.usdc (binary) or .usda (text): mesh, materials, size in the file',
      },
      images: { title: 'Texture images', note: 'PNG or JPEG files the layer points to' },
      read: 'Nothing to unpack: the device reads each file straight out of the archive.',
    },
    de: {
      file: 'side-table.usdz',
      zip: 'ZIP-Archiv ohne Kompression',
      layer: {
        title: 'USD-Ebene',
        note: '.usdc (binär) oder .usda (Text): Mesh, Materialien, gespeicherte Größe',
      },
      images: { title: 'Texturbilder', note: 'PNG- oder JPEG-Bilder, auf die die Ebene verweist' },
      read: 'Kein Entpacken: Das Gerät liest jede Datei direkt aus dem Archiv.',
    },
    fr: {
      file: 'side-table.usdz',
      zip: 'Archive zip sans compression',
      layer: {
        title: 'Couche USD',
        note: '.usdc (binaire) ou .usda (texte) : maillage, matériaux, dimensions enregistrées',
      },
      images: {
        title: 'Images de texture',
        note: 'Fichiers PNG ou JPEG liés à la couche',
      },
      read: 'Aucune extraction : l’appareil lit les fichiers directement dans l’archive.',
    },
    it: {
      file: 'side-table.usdz',
      zip: 'Archivio zip senza compressione',
      layer: {
        title: 'Livello USD',
        note: '.usdc (binario) o .usda (testo): mesh, materiali, dimensioni nel file',
      },
      images: {
        title: 'Immagini delle texture',
        note: 'File PNG o JPEG a cui rimanda il livello',
      },
      read: 'Niente da estrarre: il dispositivo legge ogni file nell’archivio.',
    },
    pt: {
      file: 'side-table.usdz',
      zip: 'Pacote zip sem compressão',
      layer: {
        title: 'Camada USD',
        note: '.usdc (binário) ou .usda (texto): malha, materiais, dimensões no ficheiro',
      },
      images: {
        title: 'Imagens de textura',
        note: 'Ficheiros PNG ou JPEG referidos na camada',
      },
      read: 'Não é preciso extrair: o dispositivo lê os ficheiros diretamente do pacote.',
    },
  },
  function UsdzAnatomy({ t }) {
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-foreground/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tag className="text-foreground">{t.file}</Tag>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Archive className="size-4" aria-hidden />
              {t.zip}
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Node icon={FileBox} title={t.layer.title} note={t.layer.note} />
            <Node icon={Image} title={t.images.title} note={t.images.note} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{t.read}</p>
      </div>
    );
  },
);

/** The two ways into AR Quick Look on an iPhone, and the two views it opens. */
export const quickLookPath = defineDiagram(
  {
    en: {
      routes: [
        {
          title: 'A web page in Safari',
          note: 'Link with rel="ar" round a preview image; Safari adds an AR badge',
        },
        { title: 'A file in Messages, Mail or Files', note: 'Tap the .usdz attachment' },
      ],
      quickLook: 'AR Quick Look',
      views: [
        { title: 'Object view', note: 'Spin it with one finger' },
        { title: 'AR view', note: 'Camera on, tap the floor to place it' },
      ],
      size: 'AR uses the size stored in the file. A model made from a photo has no measured size.',
      android: 'Android does not open USDZ: it shows the GLB in Scene Viewer instead.',
    },
    de: {
      routes: [
        {
          title: 'Eine Webseite in Safari',
          note: 'Vorschaubild als Link mit rel="ar"; Safari ergänzt das AR-Symbol',
        },
        { title: 'Datei in Nachrichten, Mail oder Dateien', note: 'Tippe den .usdz-Anhang an' },
      ],
      quickLook: 'AR Quick Look',
      views: [
        { title: 'Objektansicht', note: 'Mit einem Finger drehen' },
        { title: 'AR-Ansicht', note: 'Kamera an, zum Platzieren auf den Boden tippen' },
      ],
      size: 'AR nutzt die Größe aus der Datei. Ein Foto liefert keine gemessenen Maße.',
      android: 'Android öffnet keine USDZ, sondern GLB in Scene Viewer.',
    },
    fr: {
      routes: [
        {
          title: 'Une page web dans Safari',
          note: 'Lien rel="ar" autour d’une image ; Safari ajoute un badge RA',
        },
        {
          title: 'Un fichier dans Messages, Mail ou Fichiers',
          note: 'Touche la pièce jointe .usdz',
        },
      ],
      quickLook: 'AR Quick Look',
      views: [
        {
          title: 'Vue Objet',
          note: 'Fais-le tourner d’un doigt',
        },
        {
          title: 'Vue RA',
          note: 'Caméra activée, touche le sol pour le placer',
        },
      ],
      size: 'La RA utilise la taille enregistrée dans le fichier. Un modèle issu d’une photo n’a pas de dimensions mesurées.',
      android: 'Android n’ouvre pas les fichiers USDZ : il affiche le GLB dans Scene Viewer.',
    },
    it: {
      routes: [
        {
          title: 'Una pagina web in Safari',
          note: 'Immagine in un link rel="ar"; Safari aggiunge il simbolo AR',
        },
        {
          title: 'Un file in Messaggi, Mail o File',
          note: 'Tocca l’allegato .usdz',
        },
      ],
      quickLook: 'AR Quick Look',
      views: [
        {
          title: 'Vista Oggetto',
          note: 'Ruotalo con un dito',
        },
        {
          title: 'Vista AR',
          note: 'Fotocamera accesa, tocca il pavimento',
        },
      ],
      size: 'L’AR usa le dimensioni salvate nel file. Un modello da foto non ha dimensioni misurate.',
      android: 'Android non apre USDZ: mostra il GLB in Scene Viewer.',
    },
    pt: {
      routes: [
        {
          title: 'Uma página web no Safari',
          note: 'Imagem com ligação rel="ar"; o Safari acrescenta o símbolo RA',
        },
        {
          title: 'Um ficheiro em Mensagens, Mail ou Ficheiros',
          note: 'Toca no anexo .usdz',
        },
      ],
      quickLook: 'AR Quick Look',
      views: [
        {
          title: 'Vista Objeto',
          note: 'Roda-o com um dedo',
        },
        {
          title: 'Vista RA',
          note: 'Câmara ligada, toca no chão para o colocar',
        },
      ],
      size: 'A RA usa as dimensões guardadas no ficheiro. Uma foto não fornece medidas da peça.',
      android: 'O Android não abre USDZ: mostra o GLB no Scene Viewer.',
    },
  },
  function QuickLookPath({ t }) {
    const routeIcons = [Monitor, MessageSquare];
    const viewIcons = [Smartphone, View];
    return (
      <div className="space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          {t.routes.map((route, index) => (
            <Node
              key={route.title}
              icon={routeIcons[index]}
              title={route.title}
              note={route.note}
            />
          ))}
        </div>
        <FlowArrow />
        <div className="rounded-md border border-foreground/60 p-2">
          <Heading>{t.quickLook}</Heading>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {t.views.map((view, index) => (
              <Node key={view.title} icon={viewIcons[index]} title={view.title} note={view.note} />
            ))}
          </div>
        </div>
        <ul className="space-y-1 pt-1 text-xs text-muted-foreground">
          <li>{t.size}</li>
          <li>{t.android}</li>
        </ul>
      </div>
    );
  },
);
