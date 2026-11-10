import type { SVGProps } from 'react';

// The pointer that "operates" the demo controls. Filled, unlike lucide's outline cursors.
export function DemoCursor(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="cursor"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M5 3.5 22.5 12.6l-7.6 2.3-2.5 7.6z"
        fill="currentColor"
        stroke="var(--cursor-stroke, #0a0a0b)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The easyrender cube, drawn as its three visible faces.
export function CubeMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 2.6 20.2 7.3v9.4L12 21.4 3.8 16.7V7.3z M12 12 3.8 7.3 M12 12l8.2-4.7 M12 12v9.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Unit mark after a triangle count. Drawn in CSS because the data face has no ▲ glyph; pass a
// label wherever the count is read out on its own.
export function TriMark({ label }: { label?: string }) {
  return (
    <>
      <span className="tri" aria-hidden="true" />
      {label && <span className="sr-only">{label}</span>}
    </>
  );
}
