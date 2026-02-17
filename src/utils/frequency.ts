import type { Frequency } from '@/types';

const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60;

export function frequencyToPeriodsPerYear(frequency: Frequency) {
	const match = /^(\d+)(s|m|h|d|w|mo)$/.exec(frequency);
	if (!match) return null;

	const amount = Number(match[1]);
	if (!Number.isFinite(amount) || amount <= 0) return null;

	switch (match[2]) {
		case 's':
			return SECONDS_PER_YEAR / amount;
		case 'm':
			return SECONDS_PER_YEAR / (amount * 60);
		case 'h':
			return SECONDS_PER_YEAR / (amount * 60 * 60);
		case 'd':
			return SECONDS_PER_YEAR / (amount * 24 * 60 * 60);
		case 'w':
			return SECONDS_PER_YEAR / (amount * 7 * 24 * 60 * 60);
		case 'mo':
			return 12 / amount;
		default:
			return null;
	}
}

export function annualiseReturn(
	totalReturn: number | null | undefined,
	periods: number,
	frequency: Frequency,
) {
	const periodsPerYear = frequencyToPeriodsPerYear(frequency);
	if (totalReturn == null || !Number.isFinite(totalReturn) || periods <= 0 || !periodsPerYear) {
		return null;
	}
	// Compounded annual return is undefined for non-positive terminal wealth.
	// Surface blow-ups as -100% instead of hiding the metric.
	if (1 + totalReturn <= 0) {
		return -1;
	}
	return (1 + totalReturn) ** (periodsPerYear / periods) - 1;
}

export function annualiseSharpe(sharpe: number | null | undefined, frequency: Frequency) {
	const periodsPerYear = frequencyToPeriodsPerYear(frequency);
	if (sharpe == null || !Number.isFinite(sharpe) || !periodsPerYear) return null;
	return sharpe * Math.sqrt(periodsPerYear);
}
