'use client';
import type { OverviewSeries } from '@easyrender/core/admin-analytics';
import type { Chart } from '@easyrender/core/admin-analytics/helpers';
import { formatNumber } from '@easyrender/core/admin-analytics/helpers';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const colors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];
const overviewKeys = ['visits', 'payingCustomers', 'uses', 'revenue', 'newSignups'] as const;

export function OverviewChart({
  data,
  labels,
  hasMultipleCurrencies,
}: {
  data: OverviewSeries;
  labels: Record<string, string>;
  hasMultipleCurrencies: boolean;
}) {
  const [hidden, setHidden] = useState<string[]>(['newSignups']);
  const label = (key: string) => labels[key] ?? key;
  const seriesLabel = (key: string) =>
    key === 'revenue' ? `${label('grossRevenueSeries')} (${data.currency})` : label(key);
  const config = Object.fromEntries(
    overviewKeys.map((key, i) => [key, { label: seriesLabel(key), color: colors[i] }]),
  );
  const countMax = Math.max(
    1,
    ...data.rows.flatMap((r) =>
      overviewKeys
        .filter((key) => key !== 'revenue' && !hidden.includes(key))
        .map((key) => r[key] ?? 0),
    ),
  );
  // Explicit square-root ticks keep small counts legible and still display real counts.
  const countTicks = [...new Set([0, 0.25, 0.5, 0.75, 1].map((v) => Math.ceil(countMax * v * v)))];
  return (
    <Card className="h-[560px] min-w-0 sm:h-[460px]" data-testid="overview-timeseries">
      <CardHeader className="gap-2">
        <CardTitle>{label(data.heading)}</CardTitle>
        <CardDescription>{label('overviewScale')}</CardDescription>
        {hasMultipleCurrencies && <CardDescription>{label('multipleCurrencies')}</CardDescription>}
        <fieldset className="flex flex-wrap items-center gap-2" aria-label={label('seriesToggles')}>
          {overviewKeys.map((key, i) => (
            <Button
              key={key}
              size="sm"
              variant={hidden.includes(key) ? 'outline' : 'secondary'}
              aria-pressed={!hidden.includes(key)}
              disabled={key === 'visits' && Boolean(data.visitsNote)}
              onClick={() =>
                setHidden((current) =>
                  current.includes(key) ? current.filter((s) => s !== key) : [...current, key],
                )
              }
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: colors[i] }} />
              {seriesLabel(key)}
            </Button>
          ))}
          {data.visitsNote && (
            <span className="text-xs text-muted-foreground" role="status">
              {label(data.visitsNote)}
            </span>
          )}
        </fieldset>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        {!data.hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {label('empty')}
          </div>
        ) : (
          <ChartContainer className="h-full" label={label(data.heading)} config={config}>
            <ComposedChart data={data.rows} margin={{ top: 16, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={32} />
              <YAxis
                yAxisId="count"
                scale="sqrt"
                domain={[0, countMax]}
                ticks={countTicks}
                width={45}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="money"
                orientation="right"
                width={72}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => formatNumber(value)}
              />
              <ChartTooltip
                content={({ active, label: date }) => {
                  const row = data.rows.find((r) => r.date === date);
                  if (!active || !row) return null;
                  return (
                    <div
                      className="rounded-lg border bg-background p-3 text-xs shadow-md"
                      data-testid="overview-tooltip"
                    >
                      <p className="mb-2 font-medium">{row.date}</p>
                      {overviewKeys
                        .filter((key) => key !== 'newSignups' || !hidden.includes(key))
                        .map((key) => (
                          <div key={key} className="mb-2 last:mb-0">
                            <div className="flex justify-between gap-6">
                              <span>{seriesLabel(key)}</span>
                              <span className="font-mono tabular-nums">
                                {formatNumber(
                                  row[key],
                                  key === 'revenue' ? 'currency' : 'number',
                                  data.currency,
                                )}
                              </span>
                            </div>
                            {key === 'payingCustomers' && (
                              <p className="text-muted-foreground">
                                {label(
                                  data.heading === 'overviewPerDay'
                                    ? 'payingDayHelp'
                                    : data.heading === 'overviewPerWeek'
                                      ? 'payingWeekHelp'
                                      : 'payingMonthHelp',
                                )}
                              </p>
                            )}
                            {key === 'uses' && (
                              <p className="text-muted-foreground">
                                {formatNumber(row.sheets)} {label('sheetCountUnit')} +{' '}
                                {formatNumber(row.models)} {label('models3d')}
                              </p>
                            )}
                            {key === 'revenue' && (
                              <p className="text-muted-foreground">{label('grossRevenueHelp')}</p>
                            )}
                            {key === 'visits' && data.visitsNote && (
                              <p className="text-muted-foreground">{label(data.visitsNote)}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  );
                }}
              />
              {overviewKeys.map((key, i) => (
                <Line
                  key={key}
                  yAxisId={key === 'revenue' ? 'money' : 'count'}
                  dataKey={key}
                  name={seriesLabel(key)}
                  hide={hidden.includes(key) || (key === 'visits' && Boolean(data.visitsNote))}
                  stroke={colors[i]}
                  strokeWidth={2}
                  strokeDasharray={key === 'visits' ? '4 3' : undefined}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                  isAnimationActive={false}
                  type="linear"
                />
              ))}
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsChart({
  chart,
  labels,
  compare,
}: {
  chart: Chart;
  labels: Record<string, string>;
  compare: boolean;
}) {
  const label = (key: string) => labels[key] ?? key;
  const series = chart.series.filter((s) => compare || !s.startsWith('previous'));
  const config = Object.fromEntries(
    series.map((s, i) => [s, { label: label(s), color: colors[i % colors.length] }]),
  );
  const data = chart.rows.map((row) => ({
    ...row,
    name: typeof row.name === 'string' ? label(row.name) : row.name,
    step: typeof row.step === 'string' ? label(row.step) : row.step,
  }));
  const x =
    chart.rows[0] &&
    ('date' in chart.rows[0]
      ? 'date'
      : 'step' in chart.rows[0]
        ? 'step'
        : 'source' in chart.rows[0]
          ? 'source'
          : 'name');
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{label(chart.key)}</CardTitle>
        <CardDescription>{chart.currency ?? label('counts')}</CardDescription>
      </CardHeader>
      <CardContent>
        {!data.length ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            {label('empty')}
          </div>
        ) : (
          <ChartContainer label={label(chart.key)} config={config}>
            {chart.kind === 'donut' ? (
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={95}
                  isAnimationActive={false}
                >
                  {data.map((row, i) => (
                    <Cell key={String(row.name)} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend />
              </PieChart>
            ) : chart.kind === 'area' ? (
              <AreaChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey={x || 'date'} tickLine={false} axisLine={false} minTickGap={30} />
                <YAxis yAxisId="money" tickLine={false} axisLine={false} width={50} />
                <YAxis
                  yAxisId="count"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend />
                {series.map((key, i) => (
                  <Area
                    key={key}
                    yAxisId={key.toLowerCase().includes('signups') ? 'count' : 'money'}
                    name={label(key)}
                    dataKey={key}
                    stroke={colors[i % colors.length]}
                    fill={colors[i % colors.length]}
                    fillOpacity={key.startsWith('previous') ? 0 : 0.08}
                    strokeDasharray={key.startsWith('previous') ? '5 5' : undefined}
                    isAnimationActive={false}
                    type="monotone"
                  />
                ))}
              </AreaChart>
            ) : (
              <BarChart data={data} layout={chart.key === 'channels' ? 'vertical' : 'horizontal'}>
                <CartesianGrid vertical={false} />
                <XAxis
                  type={chart.key === 'channels' ? 'number' : 'category'}
                  dataKey={chart.key === 'channels' ? undefined : x || 'date'}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={20}
                />
                <YAxis
                  type={chart.key === 'channels' ? 'category' : 'number'}
                  dataKey={chart.key === 'channels' ? 'name' : undefined}
                  tickLine={false}
                  axisLine={false}
                  width={chart.key === 'channels' ? 110 : 40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend />
                {series.map((key, i) => (
                  <Bar
                    key={key}
                    name={label(key)}
                    dataKey={key}
                    fill={colors[i % colors.length]}
                    stackId={
                      ['generation', 'revenueTime'].includes(chart.key) ? 'total' : undefined
                    }
                    radius={3}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
