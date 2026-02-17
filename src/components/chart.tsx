import uPlot from 'uplot';
import UplotReact from 'uplot-react';
import 'uplot/dist/uPlot.min.css';
import { useMeasure } from 'rooks';

import { devalue } from '@/lib/lang';
import { colour } from '@/utils/css';

import type { BacktestOutput } from '@/lib/backtest';
import type { Input, Value } from '@/types';

type ChartProps = {
	input?: Input;
	output?: Value;
	backtest?: BacktestOutput;
};

export function buildModel(input?: Input, output?: Value, backtest?: BacktestOutput) {
	const price = input?.eager.price ?? [];
	const volume = input?.eager.volume ?? [];
	const length = price.length;
	const N = Array.from({ length }, (_, index) => index + 1);
	const basePrice = price[0] ?? 1;
	const normalisedPrice = basePrice !== 0 ? price.map((value) => value / basePrice) : price;
	const position = output ? devalue(output, length) : N.map(() => 0);
	const equity = backtest?.equity ?? new Array<number>(length).fill(1);
	const data = [N, normalisedPrice, equity, volume, position];
	return { data, basePrice };
}

export function Chart({ input, output, backtest }: ChartProps) {
	const [ref, { innerWidth, innerHeight }] = useMeasure();
	const model = buildModel(input, output, backtest);
	const basePrice = model.basePrice ?? 1;
	const data = model.data;

	return (
		<div ref={ref} className="h-[calc(100vh-320px)] min-h-0 chart-uplot">
			<style>{`
        .u-select {
          background-color: color-mix(in hsl, var(--ring), transparent 90%);
        }

        .chart-uplot .u-legend,
        .chart-uplot .u-label,
        .chart-uplot .u-inline {
          font-family: var(--font-sans);
        }
      `}</style>
			<UplotReact
				options={{
					width: innerWidth,
					height: innerHeight,
					series: [
						{
							label: 'Time',
						},
						{
							label: 'Price',
							stroke: colour('--color-chart-1'),
							width: 2,
							scale: 'price',
							value: (_u, v) => (v == null ? '' : (v * basePrice).toFixed(2)),
						},
						{
							label: 'Equity',
							stroke: colour('--color-chart-2'),
							width: 2,
							scale: 'price',
							value: (_u, v) => (v == null ? '' : v.toFixed(2)),
						},
						{
							label: 'Volume',
							stroke: colour('--color-chart-3'),
							fill: colour('--color-chart-3'),
							alpha: 0.25,
							scale: 'volume',
							paths: uPlot.paths.bars({ size: [0.6, 100] }),
							points: { show: false },
						},
						{
							label: 'Position',
							stroke: colour('--color-chart-4'),
							fill: colour('--color-chart-4'),
							alpha: 0.25,
							scale: 'position',
							paths: () => null,
							points: { show: false },
						},
					],
					scales: {
						x: { time: false },
						price: { auto: true },
						position: {
							range: () => [-1, 1],
						},
						volume: {
							auto: true,
							range: (_, __, max) => [0, max * 1],
						},
					},
					axes: [
						{
							stroke: colour('--color-muted-foreground'),
							grid: { show: false },
							values: (_, ticks) => ticks,
						},
						{
							stroke: colour('--color-muted-foreground'),
							grid: { show: false },
							side: 1,
							values: (_, ticks) => ticks,
						},
					],
					padding: [0, 0, 0, 0],
					legend: { show: true },
					hooks: {
						draw: [drawPositionBars],
					},
				}}
				data={data}
			/>
		</div>
	);
}

const drawPositionBars = (u: uPlot) => {
	const idx = 4;
	if (u.series[idx]?.show === false) return;
	const vals = u.data[idx] as (number | null | undefined)[];
	if (!vals || vals.length === 0) return;

	const xVals = u.data[0] as number[];
	const ctx = u.ctx;
	const { left, top, width, height } = u.bbox;
	const y0 = u.valToPos(0, 'position', true);

	ctx.save();
	ctx.beginPath();
	ctx.rect(left, top, width, height);
	ctx.clip();

	const count = vals.length;
	for (let i = 0; i < count; i += 1) {
		const v = vals[i];
		if (v == null) continue;
		const x = u.valToPos(xVals[i], 'x', true);
		const nextX = i + 1 < count ? u.valToPos(xVals[i + 1], 'x', true) : x + 1;
		const barW = Math.max(1, Math.abs(nextX - x) * 0.6);
		const x0 = x - barW / 2;
		const y = u.valToPos(v, 'position', true);
		const yTop = Math.min(y, y0);
		const barH = Math.abs(y0 - y);

		ctx.fillStyle = v >= 0 ? '#22c55e' : '#ef4444';
		ctx.globalAlpha = 0.35;
		ctx.fillRect(x0, yTop, barW, barH);
	}

	ctx.restore();
};
