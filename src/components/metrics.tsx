import { cn } from '@/utils/css';
import { formatNumber, formatPercent } from '@/utils/number';

export type MetricItem = {
	key: string;
	label: string;
	value: number | null | undefined;
	format: 'number' | 'percent';
	polarity?: 'neutral' | 'signed';
};

type MetricsProps = {
	metrics: MetricItem[];
};

function formatValue(item: MetricItem) {
	if (!Number.isFinite(item.value)) return '—';
	return item.format === 'percent' ? formatPercent(item.value) : formatNumber(item.value);
}

function colour(item: MetricItem) {
	if (item.polarity !== 'signed') return '';
	if (!Number.isFinite(item.value) || !item?.value) return '';
	return item?.value > 0 ? 'bg-green-500/20' : 'bg-red-500/20';
}

export function Metrics({ metrics }: MetricsProps) {
	return (
		<div className="grid grid-cols-2">
			{metrics.map((item) => (
				<div key={item.key} className={cn('space-y-1 p-2', colour(item))}>
					<div className="text-xs uppercase tracking-wide font-extrabold text-muted-foreground">
						{item.label}
					</div>
					<div className="font-semibold">{formatValue(item)}</div>
				</div>
			))}
		</div>
	);
}
