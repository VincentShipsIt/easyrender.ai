'use client';

import { Check, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import { Badge } from '@/components/ui/badge';
import type { ShowcaseItem } from '@/lib/showcase';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    title: 'One flat photo',
    body: 'Your agent grabs a product photo from your catalogue, a listing or a supplier email. No scan, no studio.',
    call: 'create_render({ image_url })',
  },
  {
    title: 'Read the shape',
    body: 'easyrender reads depth, proportions and materials from that single image.',
    call: 'get_render → preview_ready',
  },
  {
    title: 'Build every side',
    body: 'A clean mesh is rebuilt all the way round, even the sides the camera never saw.',
    call: 'render_3d({ id })',
  },
  {
    title: 'A real 3D model',
    body: 'Textured GLB and USDZ, saved to your library. Spin it on a listing or open it in AR.',
    call: 'status: ready · model.glb',
  },
];

// 0 → 1 between a and b, eased.
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Scroll-driven: the section is several screens tall and the scene is pinned while you scroll
// through it. Scroll progress drives the real GLB in three.js (no video): the flat photo fades
// into a point cloud, then a wireframe, then the textured model as it turns.
// `photoAngle` is the turn (radians) at which the model matches the photo's camera angle.
export function FlatTo3D({ item, photoAngle = 0 }: { item: ShowcaseItem; photoAngle?: number }) {
  const section = useRef<HTMLElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Scroll position → target progress (0 at the top of the section, 1 once it is scrolled through).
  useEffect(() => {
    const onScroll = () => {
      const el = section.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const value = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      target.current = value;
      setProgress(value);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [three, { GLTFLoader }, { RoomEnvironment }] = await Promise.all([
        import('three'),
        import('three/addons/loaders/GLTFLoader.js'),
        import('three/addons/environments/RoomEnvironment.js'),
      ]);
      if (disposed) return;

      const renderer = new three.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = three.SRGBColorSpace;
      renderer.toneMapping = three.ACESFilmicToneMapping;
      host.appendChild(renderer.domElement);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      const scene = new three.Scene();
      const pmrem = new three.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const camera = new three.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0.15, 5.4);
      camera.lookAt(0, 0, 0);

      const ink = new three.Color(
        window.matchMedia('(prefers-color-scheme: dark)').matches ? '#d4d4d8' : '#27272a',
      );

      // The flat photo, as a card facing the camera.
      const photoTexture = await new three.TextureLoader().loadAsync(item.photo);
      photoTexture.colorSpace = three.SRGBColorSpace;
      const photoMaterial = new three.MeshBasicMaterial({ map: photoTexture, transparent: true });
      const photo = new three.Mesh(new three.PlaneGeometry(2.3, 2.3), photoMaterial);
      scene.add(photo);

      // The model: textured, wireframe and point cloud layers share one geometry.
      const gltf = await new GLTFLoader().loadAsync(item.model);
      if (disposed) return;
      // Squash along the camera axis (outer) so the model starts as flat as the photo, then
      // turn it (inner), starting from the angle the photo was taken at.
      const depth = new three.Group();
      const spin = new three.Group();
      depth.add(spin);
      scene.add(depth);

      const model = gltf.scene;
      const box = new three.Box3().setFromObject(model);
      const size = box.getSize(new three.Vector3());
      const center = box.getCenter(new three.Vector3());
      const scale = 1.9 / Math.max(size.x, size.y, size.z);
      model.position.sub(center);
      const normalized = new three.Group();
      normalized.add(model);
      normalized.scale.setScalar(scale);
      spin.add(normalized);

      const textured: THREE.Material[] = [];
      const wireMaterial = new three.MeshBasicMaterial({
        color: ink,
        wireframe: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const pointMaterial = new three.PointsMaterial({
        color: ink,
        size: 0.018,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const overlays: THREE.Object3D[] = [];
      model.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (!mesh.isMesh) return;
        for (const material of [mesh.material].flat()) {
          material.transparent = true;
          textured.push(material);
        }
        const wire = new three.Mesh(mesh.geometry, wireMaterial);
        const points = new three.Points(mesh.geometry, pointMaterial);
        for (const overlay of [wire, points]) {
          overlay.position.copy(mesh.position);
          overlay.quaternion.copy(mesh.quaternion);
          overlay.scale.copy(mesh.scale);
          overlays.push(overlay);
          mesh.parent?.add(overlay);
        }
      });

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = host;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(host);

      let visible = true;
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(host);

      let shown = 0;
      let frame = 0;
      const clock = new three.Clock();
      const tick = () => {
        frame = requestAnimationFrame(tick);
        if (!visible) return;
        // Ease toward the scroll target so trackpads and wheels both feel smooth.
        shown += (target.current - shown) * 0.12;
        const p = shown;
        const idle = clock.getElapsedTime() * 0.15;

        const photoOut = smooth(0.08, 0.3, p);
        photoMaterial.opacity = 1 - photoOut;
        photo.visible = photoMaterial.opacity > 0.01;
        photo.position.z = -photoOut * 0.6;
        photo.scale.setScalar(1 - photoOut * 0.08);

        depth.scale.z = 0.03 + 0.97 * smooth(0.14, 0.5, p);
        spin.rotation.y =
          photoAngle + smooth(0.18, 1, p) * Math.PI * 1.6 + (p > 0.98 ? idle % (Math.PI * 2) : 0);
        spin.rotation.x = 0.08 * smooth(0.2, 0.6, p);

        pointMaterial.opacity = smooth(0.08, 0.22, p) * (1 - smooth(0.42, 0.56, p));
        wireMaterial.opacity = 0.55 * smooth(0.36, 0.5, p) * (1 - smooth(0.7, 0.84, p));
        const solid = smooth(0.62, 0.8, p);
        for (const material of textured) {
          material.opacity = solid;
          material.depthWrite = solid > 0.98;
        }
        for (const overlay of overlays) overlay.visible = solid < 0.99;

        renderer.render(scene, camera);
      };
      tick();
      setLoaded(true);

      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        io.disconnect();
        renderer.dispose();
        pmrem.dispose();
        renderer.domElement.remove();
      };
    })().catch((error) => console.error('flat-to-3d failed to load', error));

    return () => {
      disposed = true;
      cleanup();
    };
  }, [item.model, item.photo, photoAngle]);

  // Step boundaries follow the visual phases: photo, point cloud, wireframe, textured model.
  const active = [0.12, 0.38, 0.64].filter((edge) => progress >= edge).length;

  return (
    <section ref={section} id="how-it-works" className="relative h-[360vh] border-y bg-muted/30">
      <div className="sticky top-14 flex h-[calc(100dvh-3.5rem)] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
          <div className="order-2 space-y-5 lg:order-1">
            <div className="space-y-3">
              <Badge variant="outline" className="bg-background/60">
                How it works
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                From a flat photo to a 3D model
              </h2>
            </div>
            <ol className="space-y-1">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className={cn(
                    'rounded-xl border border-transparent p-3 transition-all duration-300 sm:p-4',
                    index === active
                      ? 'border-border bg-background shadow-sm'
                      : 'opacity-50 max-lg:hidden',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs',
                        index < active && 'bg-primary text-primary-foreground',
                      )}
                    >
                      {index < active ? <Check className="size-3.5" /> : index + 1}
                    </span>
                    <p className="font-medium">{step.title}</p>
                  </div>
                  {index === active && (
                    <div className="mt-2 space-y-3 pl-9">
                      <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                      <code className="inline-block rounded-md border bg-muted/60 px-2 py-1 font-mono text-xs">
                        {step.call}
                      </code>
                    </div>
                  )}
                </li>
              ))}
            </ol>
            <div className="h-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-150"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
          <div className="relative order-1 mx-auto aspect-square w-full max-w-[min(100%,52vh)] lg:order-2 lg:max-w-none">
            <div className="pointer-events-none absolute inset-[10%] rounded-full bg-gradient-to-tr from-zinc-300/60 via-zinc-100/40 to-transparent blur-3xl dark:from-zinc-700/50 dark:via-zinc-800/30" />
            <div ref={mount} className="absolute inset-0" aria-hidden />
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                {/* biome-ignore lint/performance/noImgElement: placeholder until three.js loads */}
                <img src={item.photo} alt="" className="size-[70%] rounded-xl object-cover" />
                <Loader2 className="absolute size-5 animate-spin text-muted-foreground" />
              </div>
            )}
            <span className="sr-only">
              Animation: a flat photo of a {item.title.toLowerCase()} turning into a 3D model as you
              scroll.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
