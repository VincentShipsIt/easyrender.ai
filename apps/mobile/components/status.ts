import type { RenderView } from '@/lib/api';

export const STATUS_LABEL: Record<RenderView['status'], string> = {
  drafting: 'Preparing preview',
  preview_ready: 'Preview ready',
  rendering: 'Building 3D',
  ready: '3D ready',
  failed: 'Failed',
};

export const isInFlight = (render: Pick<RenderView, 'status'>) =>
  render.status === 'drafting' || render.status === 'rendering';

// Credits still owed to build the 3D model (the angle sheet counts toward it).
export const owed = (render: RenderView) => Math.max(0, render.renderCredits - render.credits);
