import { devalue } from '@/lib/lang';

import type { Input, Value } from '@/types';

export type BacktestOutput = {
	equity: number[];
	metrics: BacktestMetrics;
};

export type BacktestMetrics = {
	return: number | null;
	drawdown: number | null;
	volatility: number | null;
	sharpe: number | null;
};

const clampPosition = (x: number) => Math.max(-1, Math.min(1, x));

export function runBacktest(input: Input, output: Value, costs: number): BacktestOutput {
	const price = input.eager.price;
	const N = price.length;
	const positions = devalue(output, N);

	const equities = new Array<number>(N);
	const costRate = Number.isFinite(costs) ? Math.max(0, costs) : 0;

	let equity = 1;
	equities[0] = equity;

	let lastPosition = clampPosition(positions[0] ?? 0);

	let mean = 0;
	let m2 = 0;
	let count = 0;

	let peak = 1;
	let maxDrawdown = 0;

	for (let i = 1; i < N; i++) {
		const currentReturn = (price[i] - price[i - 1]) / price[i - 1];
		const position = clampPosition(positions[i] ?? 0);
		const turnover = Math.abs(position - lastPosition);
		const cost = costRate * turnover;
		const returns = lastPosition * currentReturn - cost;

		equity *= 1 + returns;
		equities[i] = equity;

		count++;
		const delta = returns - mean;
		mean += delta / count;
		m2 += delta * (returns - mean);

		if (equity > peak) peak = equity;
		const drawdown = equity / peak - 1;
		if (drawdown < maxDrawdown) maxDrawdown = drawdown;

		lastPosition = position;
	}

	const variance = count > 1 ? m2 / count : 0;
	const std = Math.sqrt(variance);

	return {
		equity: equities,
		metrics: {
			return: equity - 1,
			volatility: std,
			sharpe: std > 0 ? mean / std : null,
			drawdown: maxDrawdown,
		},
	};
}
