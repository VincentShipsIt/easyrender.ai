'use client';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
export type ChartConfig = Record<string, { label: string; color: string }>;
// shadcn-style chart shell: scoped semantic CSS variables, responsive canvas and accessible title.
export function ChartContainer({
  config,
  children,
  className,
  label,
  ...props
}: {
  config: ChartConfig;
  children: ComponentProps<typeof ResponsiveContainer>['children'];
  label: string;
} & ComponentProps<'div'>) {
  const style = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [`--color-${key}`, value.color]),
  ) as CSSProperties;
  return (
    <div
      data-slot="chart"
      role="img"
      aria-label={label}
      className={cn(
        'h-72 min-w-0 text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-surface]:outline-none',
        className,
      )}
      style={style}
      {...props}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 600, height: 288 }}
      >
        {children}
      </ResponsiveContainer>
    </div>
  );
}
export const ChartTooltip = Tooltip;
export const ChartLegend = Legend;
export function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    name?: string | number;
    value?: string | number;
    dataKey?: string | number;
  }>;
  label?: ReactNode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 text-xs shadow-md">
      <div className="mb-2 font-medium">{label}</div>
      {payload.map((item) => (
        <div key={String(item.dataKey)} className="flex justify-between gap-6">
          <span className="text-muted-foreground">{item.name}</span>
          <span className="font-mono tabular-nums">
            {typeof item.value === 'number'
              ? new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(item.value)
              : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
