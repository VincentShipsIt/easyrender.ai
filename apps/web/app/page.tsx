import { config } from '@easyrender/core';
import { ArrowRight, Bot, KeyRound, LayoutDashboard, Plug, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { AgentDemo } from '@/components/agent-demo';
import { FlatTo3D } from '@/components/flat-to-3d';
import { GalleryGrid } from '@/components/gallery-grid';
import { Faq, FinalCta, Pricing, RealEstate, Section } from '@/components/landing';
import { McpSetup } from '@/components/mcp-setup';
import { PromptBar } from '@/components/prompt-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { currentUser } from '@/lib/actor';
import { getGallery } from '@/lib/gallery';
import { HERO_ITEM } from '@/lib/showcase';

const CLIENTS = ['Claude Code', 'Claude Desktop', 'Cursor', 'VS Code'];

const CONNECT_STEPS = [
  { icon: KeyRound, key: 'key' },
  { icon: Plug, key: 'paste' },
  { icon: LayoutDashboard, key: 'watch' },
] as const;

export default async function HomePage() {
  const [user, gallery, t] = await Promise.all([
    currentUser().catch(() => null),
    getGallery(6),
    getTranslations('Home'),
  ]);
  const mcpUrl = `${config.appUrl()}/api/mcp`;

  return (
    <>
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-muted),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-24">
          <div className="min-w-0 space-y-6 text-center lg:text-left">
            <Badge variant="outline" className="gap-1.5 bg-background/60 py-1">
              <Bot />
              {t('hero.badge')}
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0">
              {t('hero.description')}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button size="lg" asChild>
                <Link href="#connect">
                  <Plug />
                  {t('hero.connect')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#try">
                  <Sparkles />
                  {t('hero.try')}
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('hero.worksWith', { clients: CLIENTS.join(', ') })}
            </p>
          </div>
          <AgentDemo item={HERO_ITEM} />
        </div>
      </section>

      <FlatTo3D item={HERO_ITEM} photoAngle={2.2} />

      <Section
        id="connect"
        eyebrow={t('connect.eyebrow')}
        title={t('connect.title')}
        description={t('connect.description')}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="min-w-0 space-y-4">
            <ol className="space-y-4">
              {CONNECT_STEPS.map((step, index) => (
                <li key={step.key} className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                    <step.icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">
                      <span className="mr-2 font-mono text-sm text-muted-foreground">
                        0{index + 1}
                      </span>
                      {t(`connect.steps.${step.key}.title`)}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t(`connect.steps.${step.key}.body`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link
                href={user ? '/connectors' : `/sign-up?next=${encodeURIComponent('/connectors')}`}
              >
                {user ? t('connect.openConnectors') : t('connect.getKey')}
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <Card className="min-w-0 self-start py-4">
            <CardContent className="px-4">
              <McpSetup url={mcpUrl} />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section
        id="try"
        eyebrow={t('try.eyebrow')}
        title={t('try.title')}
        description={t('try.description')}
        className="border-t bg-muted/30"
      >
        <div className="mx-auto max-w-2xl">
          <PromptBar signedIn={Boolean(user)} />
        </div>
      </Section>

      <Section
        id="gallery"
        eyebrow={t('gallery.eyebrow')}
        title={t('gallery.title')}
        description={t('gallery.description')}
        action={
          <Button variant="outline" asChild>
            <Link href="/explore">
              {t('gallery.exploreAll')}
              <ArrowRight />
            </Link>
          </Button>
        }
      >
        <GalleryGrid items={gallery} />
      </Section>

      <RealEstate />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
