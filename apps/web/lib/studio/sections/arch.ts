// Interior design: a render furnished with hub pieces. The colour temperature control follows
// the video (dusk with the lamp on → daylight, and back).

import { part, parts, watchVisible } from '../dom';
import { prefersReducedMotion } from '../engine/stage';
import type { Scope } from '../scope';

const SRC = '/studio/interior.mp4';
const POSTER = '/studio/interior.jpg';
const WARM = 2700;
const COOL = 6500;

export function initArch(panel: HTMLElement, { scope }: { scope: Scope }) {
  const video = part<HTMLVideoElement>(panel, 'video');
  const kelvin = part(panel, 'kelvin');
  const track = part(panel, 'track');
  const pins = parts(panel, 'pin');
  const still = prefersReducedMotion();
  // Set here, as the section nears the viewport: a poster in the markup is fetched with the page.
  video.poster = POSTER;

  let raf = 0;
  let shown = -1;
  const sync = () => {
    raf = 0;
    const duration = video.duration || 10.08;
    // The clip plays forward and then reversed: 0 → 1 → 0.
    const x = (video.currentTime % duration) / duration;
    const p = x < 0.5 ? x * 2 : 2 - x * 2;
    const value = Math.round((WARM + (COOL - WARM) * p) / 50) * 50;
    track.style.setProperty('--p', p.toFixed(4));
    if (value !== shown) {
      shown = value;
      kelvin.textContent = String(value);
    }
    if (!video.paused) raf = requestAnimationFrame(sync);
  };
  const follow = () => {
    if (!raf) raf = requestAnimationFrame(sync);
  };

  let loaded = false;
  scope.add(
    watchVisible(
      panel,
      (visible) => {
        if (!visible) {
          video.pause();
          return;
        }
        pins.forEach((pin, i) => {
          scope.timeout(() => pin.classList.add('is-on'), 500 + i * 260);
        });
        if (still) return;
        if (!loaded) {
          video.src = SRC;
          loaded = true;
        }
        video.play().catch(() => {});
        follow();
      },
      '100px',
    ),
  );
  scope.on(video, 'play', follow);
  scope.add(() => {
    cancelAnimationFrame(raf);
    video.pause();
    for (const pin of pins) pin.classList.remove('is-on');
  });
  track.style.setProperty('--p', '0');
}
