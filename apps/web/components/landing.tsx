import { CREDIT_PACKS, RENDER_CREDITS, rendersInPack } from '@easyrender/harness';
import {
  Building2,
  Check,
  Code2,
  Home,
  type LucideIcon,
  Rotate3d,
  Smartphone,
  Sofa,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const usd = (cents: number) => `$${(cents / 100).toLocaleString('en-US')}`;

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  action,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section id={id} className={cn('scroll-mt-20 py-16 sm:py-24', className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl space-y-3">
            <Badge variant="outline">{eyebrow}</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

const AUDIENCES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Home,
    title: 'Agents and brokers',
    body: 'Make a listing stand out with exteriors and key pieces buyers can spin and walk around.',
  },
  {
    icon: Sofa,
    title: 'Home stagers',
    body: 'Turn your furniture inventory into 3D once, then drop it into every virtual staging job.',
  },
  {
    icon: Building2,
    title: 'Developers and builders',
    body: 'Show off-plan facades and show-home furniture before the photos exist.',
  },
  {
    icon: Store,
    title: 'Furniture and decor stores',
    body: 'Give every product page a 3D viewer and a “view in your room” button.',
  },
];

const PERKS: { icon: LucideIcon; label: string }[] = [
  { icon: Rotate3d, label: 'Embeddable 3D viewer for any listing site' },
  { icon: Smartphone, label: 'AR on iPhone and Android, no app' },
  { icon: Code2, label: 'MCP server and REST API for your agents' },
];

export function RealEstate() {
  return (
    <Section
      eyebrow="Built for real estate"
      title="3D for listings, without the 3D team"
      description="Works best today on furniture, decor and building exteriors. Full rooms are on the way."
      className="border-y bg-muted/30"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCES.map((audience) => (
          <Card key={audience.title} className="gap-3">
            <CardHeader>
              <audience.icon className="mb-2 size-5 text-muted-foreground" />
              <CardTitle>{audience.title}</CardTitle>
              <CardDescription className="leading-relaxed">{audience.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-around">
        {PERKS.map((perk) => (
          <div key={perk.label} className="flex items-center gap-2 text-sm">
            <perk.icon className="size-4 text-muted-foreground" />
            {perk.label}
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      note: 'to try it',
      features: ['Connect your agent over MCP', 'Free previews of every angle', 'No credit card'],
      cta: { href: '/sign-up', label: 'Start free' },
      featured: false,
    },
    ...CREDIT_PACKS.map((pack, index) => ({
      name: pack.label,
      price: usd(pack.priceCents),
      note: `${pack.credits.toLocaleString('en-US')} credits`,
      features: [
        `About ${rendersInPack(pack)} 3D models`,
        'GLB and USDZ downloads',
        'AR viewer and embeds',
        'MCP server and REST API',
      ],
      cta: { href: `/sign-up?next=${encodeURIComponent('/credits')}`, label: `Get ${pack.label}` },
      featured: index === CREDIT_PACKS.length - 1,
    })),
  ];

  return (
    <Section
      id="pricing"
      eyebrow="Pricing"
      title="Pay per model. Credits never expire."
      description={`Previews are free. A finished 3D model costs ${RENDER_CREDITS} credits (${usd(RENDER_CREDITS)}).`}
      action={
        <Button variant="outline" asChild>
          <Link href="/credits">See all pricing</Link>
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={cn(plan.featured && 'border-primary shadow-md')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.featured && <Badge>Best value</Badge>}
              </div>
              <p className="pt-2">
                <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                <span className="ml-2 text-sm text-muted-foreground">{plan.note}</span>
              </p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 text-muted-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.featured ? 'default' : 'outline'} asChild>
                <Link href={plan.cta.href}>{plan.cta.label}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  );
}

const FAQ = [
  {
    q: 'What does "connect your agent" mean?',
    a: 'easyrender is an MCP server. Add it to Claude Code, Claude Desktop, Cursor, VS Code or any MCP client with your API key, and your agent can turn photos into 3D models on its own. Everything it makes shows up in your web dashboard.',
  },
  {
    q: 'Do I need an agent to use it?',
    a: 'No. You can upload photos in the web app, one by one or in bulk from your library. The agent just lets you run it on autopilot.',
  },
  {
    q: 'Which photos work best?',
    a: 'One sharp, well lit photo where the whole object is visible, ideally on a plain background. Catalogue shots and listing photos of a single piece or a building front work great.',
  },
  {
    q: 'What can it model today?',
    a: 'Furniture, decor objects and building exteriors. Whole interior rooms are not supported yet. Fine logos and small text come out soft.',
  },
  {
    q: 'What do I get?',
    a: 'A textured GLB for the web and a USDZ for iPhone Quick Look, plus a hosted 3D viewer you can share or embed on a listing.',
  },
  {
    q: 'Why is the preview free?',
    a: 'Before building the model we draw the object from every angle. You check that preview for free and only spend credits when it looks right.',
  },
  {
    q: 'What if a render fails?',
    a: 'Failed renders are refunded to your balance automatically.',
  },
  {
    q: 'Is my render public?',
    a: 'Finished models appear in the public gallery by default. You can hide any of yours from its page at any time.',
  },
];

export function Faq() {
  return (
    <Section id="faq" eyebrow="FAQ" title="Questions, answered">
      <Accordion type="single" collapsible className="mx-auto max-w-3xl">
        {FAQ.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}

export function FinalCta() {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-2xl border bg-primary px-6 py-14 text-center text-primary-foreground">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Hand your 3D renders to your agent
        </h2>
        <p className="max-w-xl text-primary-foreground/70">
          Connect once. Previews are free, and you only pay for the models you keep.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/#connect">Connect your agent</Link>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            asChild
          >
            <Link href="/#try">Try it with a photo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
