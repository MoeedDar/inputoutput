import { Chart } from '@/components/chart';
import { Metrics } from '@/components/metrics';

import type { BacktestOutput } from '@/lib/backtest';
import type { Input, Value } from '@/types';

type OutputProps = {
	input?: Input;
	output: Value;
	backtest?: BacktestOutput;
	error?: string;
};

export function Output({ input, output, backtest, error }: OutputProps) {
	const metrics = [
		{
			key: 'return',
			label: 'Return',
			value: backtest?.metrics.return ?? null,
			format: 'percent' as const,
			polarity: 'signed' as const,
		},
		{
			key: 'drawdown',
			label: 'Max Drawdown',
			value: backtest?.metrics.drawdown ?? null,
			format: 'percent' as const,
			polarity: 'signed' as const,
		},
		{
			key: 'volatility',
			label: 'Volatility',
			value: backtest?.metrics.volatility ?? null,
			format: 'percent' as const,
			polarity: 'neutral' as const,
		},
		{
			key: 'sharpe',
			label: 'Sharpe',
			value: backtest?.metrics.sharpe ?? null,
			format: 'number' as const,
			polarity: 'signed' as const,
		},
	];
	return (
		<section className="h-full flex flex-col">
			{error && <OutputError error={error} />}
			<Metrics metrics={metrics} />
			<div className="min-h-0 flex-1">
				<Chart input={input} output={output} backtest={backtest} />
			</div>
		</section>
	);
}

function OutputError({ error }: { error: string }) {
	return <div className="bg-destructive text-destructive-foreground text-sm p-1">{error}</div>;
}
