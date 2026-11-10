import { config } from '@easyrender/core';
import { ENTERPRISE_BOOKING_URL } from '@easyrender/harness';
import { ArrowRight, KeyRound, LayoutDashboard, Plug } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { AgentDemo } from '@/components/agent-demo';
import { HomeIntro } from '@/components/home/home-intro';
import { Faq, Pricing, Section } from '@/components/landing';
import { McpSetup } from '@/components/mcp-setup';
import { PromptBar } from '@/components/prompt-bar';
import { StudioHero } from '@/components/studio/hero';
import { StudioIndustries } from '@/components/studio/industries';
import { StudioPipeline } from '@/components/studio/pipeline';
import { StudioClosing, StudioProof } from '@/components/studio/proof';
import { StudioShelf } from '@/components/studio/shelf';
import { StudioShell } from '@/components/studio/shell';
import { StudioTools } from '@/components/studio/tools';
import { StudioWheel } from '@/components/studio/wheel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { currentUser } from '@/lib/actor';
import { HERO_ITEM } from '@/lib/showcase';

const CLIENTS = ['Claude Code', 'Claude Desktop', 'Cursor', 'VS Code'];

const CONNECT_STEPS = [
  { icon: KeyRound, key: 'key' },
  { icon: Plug, key: 'paste' },
  { icon: LayoutDashboard, key: 'watch' },
] as const;

// The home, shared by every language: / is English, /es and the other prefixes render the same
// sections from their own messages. One component means the two homes cannot drift apart in
// structure, only in words.
export async function HomeView() {
  const [user, t, cta] = await Promise.all([
    currentUser().catch(() => null),
    getTranslations('Home'),
    getTranslations('Studio.cta'),
  ]);
  const mcpUrl = `${config.appUrl()}/api/mcp`;

  return (
    <StudioShell>
      <StudioHero ctaHref="#try" />
      <HomeIntro />
      <StudioPipeline />

      <Section
        id="try"
        title={t('try.title')}
        description={t('try.description')}
        className="defer-paint"
        narrow
      >
        <div className="sec__column">
          <PromptBar signedIn={Boolean(user)} />
        </div>
      </Section>

      <StudioIndustries salesHref={ENTERPRISE_BOOKING_URL} />
      <StudioTools />
      <StudioWheel />
      <StudioProof />

      <Section
        id="connect"
        title={t('connect.title')}
        description={t('connect.description')}
        className="defer-paint"
      >
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <AgentDemo item={HERO_ITEM} />
          <div className="min-w-0 space-y-6">
            <ol className="space-y-5">
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
            <p className="text-sm text-muted-foreground">
              {t('connect.worksWith', { clients: CLIENTS.join(', ') })}
            </p>
          </div>
        </div>
        <Card className="mt-10 min-w-0 py-4">
          <CardContent className="px-4">
            <McpSetup url={mcpUrl} />
          </CardContent>
        </Card>
      </Section>

      <Pricing />
      <Faq />
      <StudioClosing
        title={cta('title')}
        label={cta('button')}
        href={user ? '/dashboard' : '/sign-up'}
      />
      <StudioShelf />
    </StudioShell>
  );
}
