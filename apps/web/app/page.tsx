import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { GalleryGrid } from '@/components/gallery-grid';
import { HeroShowcase } from '@/components/hero-showcase';
import { Faq, FinalCta, HowItWorks, Pricing, RealEstate, Section } from '@/components/landing';
import { PromptBar } from '@/components/prompt-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { currentUser } from '@/lib/actor';
import { getGallery } from '@/lib/gallery';
import { HERO_ITEM } from '@/lib/showcase';

export default async function HomePage() {
  const [user, gallery] = await Promise.all([currentUser().catch(() => null), getGallery(6)]);

  return (
    <>
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-muted),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20 lg:pb-24">
          <div className="space-y-6 text-center lg:text-left">
            <Badge variant="outline" className="gap-1.5 bg-background/60 py-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Photo to 3D for real estate listings
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              One photo.
              <br />A real 3D model.
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0">
              Turn a listing photo of furniture, decor or a building exterior into a 3D model you
              can spin, embed and open in AR.
            </p>
            <PromptBar signedIn={Boolean(user)} />
          </div>
          <HeroShowcase item={HERO_ITEM} />
        </div>
      </section>

      <Section
        id="gallery"
        eyebrow="Gallery"
        title="Made with easyrender"
        description="Real models generated from a single photo. Open one to see the prompt, the input and every angle."
        className="pt-4 sm:pt-8"
        action={
          <Button variant="outline" asChild>
            <Link href="/explore">
              Explore all
              <ArrowRight />
            </Link>
          </Button>
        }
      >
        <GalleryGrid items={gallery} />
      </Section>

      <HowItWorks />
      <RealEstate />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
