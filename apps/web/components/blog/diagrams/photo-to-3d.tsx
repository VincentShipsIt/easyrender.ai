import {
  Box,
  Camera,
  Download,
  Eye,
  Images,
  LayoutGrid,
  Ruler,
  ScanSearch,
  Sparkles,
  Undo2,
} from 'lucide-react';
import { defineDiagram, FlowArrow, Heading, Node, Tag } from './kit';

// Guide: how-to-make-a-3d-model-from-photos.

/** Photogrammetry measures every side; image-to-3D works from one photo, so unseen sides come from that picture. */
export const photoVsPhotogrammetry = defineDiagram(
  {
    en: {
      lanes: [
        {
          heading: 'Photogrammetry',
          input: 'The object in front of you',
          steps: [
            { title: '20 to 100+ overlapping photos', note: 'Taken all the way round it' },
            { title: 'Software matches points between photos', note: 'Each surface from 2+ shots' },
            { title: 'Every surface was seen', note: 'Real detail, if the camera reached it' },
          ],
        },
        {
          heading: 'Image-to-3D',
          input: 'One photo, even a supplier’s',
          steps: [
            { title: '1 photo of one side', note: 'Sharp, plain background' },
            {
              title: 'Sides not in the photo come from it',
              note: 'Check those sides in the preview',
            },
            { title: 'Check the back in the preview', note: 'The photo did not show that side' },
          ],
        },
      ],
      needs: 'Needs',
    },
    de: {
      lanes: [
        {
          heading: 'Fotogrammetrie',
          input: 'Das Objekt steht vor dir',
          steps: [
            { title: '20 bis 100+ überlappende Fotos', note: 'Rund um den Gegenstand' },
            { title: 'Software gleicht Bildpunkte ab', note: 'Jede Fläche auf 2+ Fotos' },
            { title: 'Jede Fläche fotografiert', note: 'Details, die die Kamera erfasst hat' },
          ],
        },
        {
          heading: '3D aus einem Foto',
          input: 'Ein Foto, auch vom Lieferanten',
          steps: [
            { title: '1 Foto einer Seite', note: 'Scharf, schlichter Hintergrund' },
            {
              title: 'Nicht gezeigte Seiten ableiten',
              note: 'Dein Foto liefert die Anhaltspunkte',
            },
            { title: 'Prüfe die Rückseite', note: 'Diese Seite fehlt auf dem Foto' },
          ],
        },
      ],
      needs: 'Du brauchst',
    },
    fr: {
      lanes: [
        {
          heading: 'Photogrammétrie',
          input: 'L’objet devant toi',
          steps: [
            {
              title: '20 à 100+ photos avec recouvrement',
              note: 'Prises tout autour',
            },
            {
              title: 'Le logiciel relie les points communs',
              note: 'Chaque surface sur 2+ photos',
            },
            {
              title: 'Chaque surface a été photographiée',
              note: 'Détails visibles par l’appareil',
            },
          ],
        },
        {
          heading: 'Image-vers-3D',
          input: 'Une photo, même du fournisseur',
          steps: [
            {
              title: '1 photo d’un côté',
              note: 'Nette, fond uni',
            },
            {
              title: 'Côtés hors champ déduits de la photo',
              note: 'Vérifie-les dans l’aperçu',
            },
            {
              title: 'Vérifie le dos dans l’aperçu',
              note: 'La photo ne montre pas ce côté',
            },
          ],
        },
      ],
      needs: 'Il faut',
    },
    it: {
      lanes: [
        {
          heading: 'Fotogrammetria',
          input: 'L’oggetto davanti a te',
          steps: [
            {
              title: 'Da 20 a oltre 100 foto sovrapposte',
              note: 'Scattate tutto intorno',
            },
            {
              title: 'Il software collega i punti comuni',
              note: 'Ogni superficie in almeno 2 foto',
            },
            {
              title: 'Ogni superficie è stata fotografata',
              note: 'Dettagli ripresi dalla fotocamera',
            },
          ],
        },
        {
          heading: 'Image-to-3D',
          input: 'Una foto, anche del fornitore',
          steps: [
            {
              title: '1 foto di un lato',
              note: 'Nitida, sfondo uniforme',
            },
            {
              title: 'Lati fuori campo ricavati dalla foto',
              note: 'Controllali nell’anteprima',
            },
            {
              title: 'Controlla il retro nell’anteprima',
              note: 'La foto non mostrava quel lato',
            },
          ],
        },
      ],
      needs: 'Serve',
    },
    pt: {
      lanes: [
        {
          heading: 'Fotogrametria',
          input: 'O objeto à tua frente',
          steps: [
            {
              title: '20 a mais de 100 fotos sobrepostas',
              note: 'Tiradas a toda a volta',
            },
            {
              title: 'O programa identifica pontos comuns',
              note: 'Cada superfície em 2 ou mais fotos',
            },
            {
              title: 'Cada superfície foi fotografada',
              note: 'Detalhes que a câmara captou',
            },
          ],
        },
        {
          heading: 'Imagem para 3D',
          input: 'Uma foto tua ou do fornecedor',
          steps: [
            {
              title: '1 foto de um lado',
              note: 'Nítida, fundo liso',
            },
            {
              title: 'Lados ocultos deduzidos da foto',
              note: 'Verifica-os na pré-visualização',
            },
            {
              title: 'Verifica as costas',
              note: 'A foto não mostrava esse lado',
            },
          ],
        },
      ],
      needs: 'Precisas de',
    },
  },
  function PhotoVsPhotogrammetry({ t }) {
    const icons = [
      [Images, ScanSearch, Ruler],
      [Camera, Sparkles, Eye],
    ] as const;
    return (
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-4">
        {t.lanes.map((lane, column) => (
          <div key={lane.heading} className="flex flex-col gap-2">
            <Heading>{lane.heading}</Heading>
            <p className="text-xs text-muted-foreground">
              {t.needs}: <span className="text-foreground">{lane.input}</span>
            </p>
            {lane.steps.map((step, row) => (
              <div key={step.title} className="contents">
                {row > 0 && <FlowArrow />}
                <Node
                  icon={icons[column]?.[row]}
                  title={step.title}
                  note={step.note}
                  isStrong={row === lane.steps.length - 1}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
);

/** The two stages: a preview of every angle first, the model only once the preview is right. */
export const imageTo3dPipeline = defineDiagram(
  {
    en: {
      steps: [
        { tag: '1', title: 'One photo', note: 'The whole object, three-quarter angle' },
        { tag: '2', title: 'Angle sheet', note: 'The object drawn from several sides' },
        {
          tag: '3',
          title: 'You check it',
          note: 'Back, sides and top, which the photo did not show',
        },
        { tag: '4', title: 'Build the model', note: 'Textured mesh from those views' },
        { tag: '5', title: 'GLB and USDZ', note: 'Web and Android, iPhone and iPad' },
      ],
      preview: 'Preview',
      build: 'Model',
      loop: 'Looks wrong at step 3: change the photo, not the settings.',
    },
    de: {
      steps: [
        { tag: '1', title: 'Ein Foto', note: 'Ganzes Objekt, Dreiviertelansicht' },
        { tag: '2', title: 'Ansichtenraster', note: 'Das Objekt aus mehreren Blickwinkeln' },
        {
          tag: '3',
          title: 'Vorschau prüfen',
          note: 'Im Foto nicht zu sehen: Rückseite, Seiten, Oberseite',
        },
        { tag: '4', title: 'Modell erstellen', note: 'Mesh mit Textur aus diesen Ansichten' },
        { tag: '5', title: 'GLB und USDZ', note: 'Web und Android, iPhone und iPad' },
      ],
      preview: 'Vorschau',
      build: 'Modell',
      loop: 'Falsche Vorschau in Schritt 3: Ändere das Foto, nicht die Einstellungen.',
    },
    fr: {
      steps: [
        {
          tag: '1',
          title: 'Une photo',
          note: 'Objet entier, de trois quarts',
        },
        {
          tag: '2',
          title: 'Planche de vues',
          note: 'L’objet dessiné sous plusieurs angles',
        },
        {
          tag: '3',
          title: 'Tu vérifies',
          note: 'Dos, côtés, dessus absents de la photo',
        },
        {
          tag: '4',
          title: 'Crée le modèle',
          note: 'Maillage texturé à partir des vues',
        },
        {
          tag: '5',
          title: 'GLB et USDZ',
          note: 'Web et Android, iPhone et iPad',
        },
      ],
      preview: 'Aperçu',
      build: 'Modèle',
      loop: 'Un problème à l’étape 3 ? Change la photo, pas les réglages.',
    },
    it: {
      steps: [
        {
          tag: '1',
          title: 'Una foto',
          note: 'Oggetto intero, a tre quarti',
        },
        {
          tag: '2',
          title: 'Tavola di viste',
          note: 'L’oggetto disegnato da più lati',
        },
        {
          tag: '3',
          title: 'Controlla',
          note: 'Retro, lati e alto assenti dalla foto',
        },
        {
          tag: '4',
          title: 'Crea il modello',
          note: 'Mesh con texture da quelle viste',
        },
        {
          tag: '5',
          title: 'GLB e USDZ',
          note: 'Web e Android, iPhone e iPad',
        },
      ],
      preview: 'Anteprima',
      build: 'Modello',
      loop: 'Qualcosa non va al punto 3? Cambia foto, non le impostazioni.',
    },
    pt: {
      steps: [
        {
          tag: '1',
          title: 'Uma fotografia',
          note: 'Objeto inteiro, a três quartos',
        },
        {
          tag: '2',
          title: 'Nove vistas',
          note: 'Uma imagem com vários ângulos',
        },
        {
          tag: '3',
          title: 'Verifica',
          note: 'Costas, lados e parte de cima que a foto não mostra',
        },
        {
          tag: '4',
          title: 'Cria o modelo',
          note: 'Malha com textura a partir das vistas',
        },
        {
          tag: '5',
          title: 'GLB e USDZ',
          note: 'Web e Android, iPhone e iPad',
        },
      ],
      preview: 'Pré-visualização',
      build: 'Modelo',
      loop: 'Algo errado no passo 3? Muda a foto, não as definições.',
    },
  },
  function ImageTo3dPipeline({ t }) {
    const icons = [Camera, LayoutGrid, Eye, Box, Download];
    return (
      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          {[
            { label: t.preview, steps: t.steps.slice(0, 3), offset: 0 },
            { label: t.build, steps: t.steps.slice(3), offset: 3 },
          ].map((group, groupIndex) => (
            <div key={group.label} className="contents">
              {groupIndex > 0 && <FlowArrow />}
              <div className="rounded-md border border-dashed p-2">
                <Heading>{group.label}</Heading>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  {group.steps.map((step, index) => (
                    <div key={step.tag} className="contents">
                      {index > 0 && <FlowArrow isRow />}
                      <Node
                        className="min-w-0 flex-1"
                        icon={icons[group.offset + index]}
                        title={
                          <>
                            <Tag className="mr-1.5">{step.tag}</Tag>
                            {step.title}
                          </>
                        }
                        note={step.note}
                        isStrong={group.offset + index === 2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Undo2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          {t.loop}
        </p>
      </div>
    );
  },
);
