'use client';
import type { Chart } from '@easyrender/core/admin-analytics/helpers';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
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
