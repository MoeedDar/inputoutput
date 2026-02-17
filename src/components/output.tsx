import { Chart } from '@/components/chart';
import { Metrics } from '@/components/metrics';
import { useAppState } from '@/hooks/use-app-state';
import { annualiseReturn, annualiseSharpe } from '@/utils/frequency';

export function Output() {
	const { parameters, input, output, backtest, error } = useAppState();

	const sampleCount = Math.max(0, (backtest?.equity.length ?? 0) - 1);
	const annualisedReturn = annualiseReturn(
		backtest?.metrics.return,
		sampleCount,
		parameters.frequency,
	);
	const annualisedSharpe = annualiseSharpe(backtest?.metrics.sharpe, parameters.frequency);

	const metrics = [
		{
			key: 'return',
			label: 'Annual Return',
			value: annualisedReturn,
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
			value: annualisedSharpe,
			format: 'number' as const,
			polarity: 'signed' as const,
		},
	];
	return (
		<section className="h-full flex flex-col">
			{error && <OutputError error={error} />}
			<Metrics metrics={metrics} />
			<div className="min-h-0 flex-1">
				<Chart
					{...(input !== undefined ? { input } : {})}
					{...(output !== undefined ? { output } : {})}
					{...(backtest !== undefined ? { backtest } : {})}
				/>
			</div>
		</section>
	);
}

function OutputError({ error }: { error: string }) {
	return <div className="bg-destructive text-destructive-foreground text-sm p-1">{error}</div>;
}
