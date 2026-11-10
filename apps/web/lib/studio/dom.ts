// The section markup is rendered by React; the 3D code finds its hooks through `data-er`.
export function part<T extends Element = HTMLElement>(root: ParentNode, name: string): T {
  const element = root.querySelector<T>(`[data-er="${name}"]`);
  if (!element) throw new Error(`Missing studio element: ${name}`);
  return element;
}

export const parts = <T extends Element = HTMLElement>(root: ParentNode, name: string) =>
  Array.from(root.querySelectorAll<T>(`[data-er="${name}"]`));

// Moves a demo cursor over `target`, in the coordinates of the panel that holds both.
export function placeCursor(
  cursor: HTMLElement | SVGElement,
  panel: HTMLElement,
  target: HTMLElement,
  ox = 0.5,
  oy = 0.5,
) {
  const frame = panel.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  const x = rect.left - frame.left + rect.width * ox;
  const y = rect.top - frame.top + rect.height * oy;
  cursor.style.transform = `translate(${x}px, ${y}px)`;
}

// Calls back whenever the element enters or leaves the viewport; returns the disconnect.
export function watchVisible(
  element: Element,
  onChange: (visible: boolean) => void,
  margin = '0px',
) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) onChange(entry.isIntersecting);
    },
    { rootMargin: margin },
  );
  observer.observe(element);
  return () => observer.disconnect();
}
