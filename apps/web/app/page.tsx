import { config } from '@easyrender/core';
import { ArrowRight, Bot, KeyRound, LayoutDashboard, Plug, Sparkles } from 'lucide-react';
import Link from 'next/link';
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
  {
    icon: KeyRound,
    title: 'Get your key',
    body: 'Create a free account. Your API key is ready on the Connectors page.',
  },
  {
    icon: Plug,
    title: 'Paste it in your agent',
    body: 'One command for Claude Code, one JSON block for Cursor, VS Code or Claude Desktop.',
  },
  {
    icon: LayoutDashboard,
    title: 'Ask for 3D, watch it land',
    body: 'Every model your agent makes shows up in your web dashboard and library.',
  },
];

export default async function HomePage() {
  const [user, gallery] = await Promise.all([currentUser().catch(() => null), getGallery(6)]);
  const mcpUrl = `${config.appUrl()}/api/mcp`;

  return (
    <>
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-muted),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-24">
          <div className="min-w-0 space-y-6 text-center lg:text-left">
            <Badge variant="outline" className="gap-1.5 bg-background/60 py-1">
              <Bot />
              MCP server for photo to 3D
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Run your 3D renders on autopilot with your agent
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0">
              Connect easyrender to your AI agent once. It turns product and listing photos into
              real 3D models while you work, and every model lands in your library.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button size="lg" asChild>
                <Link href="#connect">
                  <Plug />
                  Connect your agent
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#try">
                  <Sparkles />
                  Try it with a photo
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Works with {CLIENTS.join(', ')} and any MCP client.
            </p>
          </div>
          <AgentDemo item={HERO_ITEM} />
        </div>
      </section>

      <FlatTo3D item={HERO_ITEM} photoAngle={2.2} />

      <Section
        id="connect"
        eyebrow="Connect"
        title="Plug it into your agent in 30 seconds"
        description="easyrender speaks MCP, so any agent that supports it can create renders, check them and build 3D models on your credits."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="min-w-0 space-y-4">
            <ol className="space-y-4">
              {CONNECT_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                    <step.icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">
                      <span className="mr-2 font-mono text-sm text-muted-foreground">
                        0{index + 1}
                      </span>
                      {step.title}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link
                href={user ? '/connectors' : `/sign-up?next=${encodeURIComponent('/connectors')}`}
              >
                {user ? 'Open your connectors' : 'Get your free API key'}
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
        eyebrow="Try it"
        title="Or try one photo right here"
        description="Drop a photo of furniture, decor or a building exterior. The preview is free; create an account to see it."
        className="border-t bg-muted/30"
      >
        <div className="mx-auto max-w-2xl">
          <PromptBar signedIn={Boolean(user)} />
        </div>
      </Section>

      <Section
        id="gallery"
        eyebrow="Gallery"
        title="Made with easyrender"
        description="Real models generated from a single photo. Open one to see the prompt, the input and every angle."
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

      <RealEstate />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
