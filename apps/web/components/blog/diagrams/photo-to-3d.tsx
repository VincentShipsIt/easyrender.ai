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

/** Photogrammetry measures every side; image-to-3D predicts the sides one photo cannot show. */
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
              title: 'The tool predicts the hidden sides',
              note: 'From what similar objects look like',
            },
            { title: 'The back is an estimate', note: 'Check it before you keep the model' },
          ],
        },
      ],
      needs: 'Needs',
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
        { tag: '3', title: 'You check it', note: 'Back, sides and top, where guesses fail' },
        { tag: '4', title: 'Build the model', note: 'Textured mesh from those views' },
        { tag: '5', title: 'GLB and USDZ', note: 'Web and Android, iPhone and iPad' },
      ],
      preview: 'Preview',
      build: 'Model',
      loop: 'Looks wrong at step 3: change the photo, not the settings.',
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
