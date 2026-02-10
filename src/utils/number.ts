function formatNumberBase(fn: (value: number, digits: number) => string) {
	return (value: number | null | undefined, digits: number = 2) => {
		if (value === undefined || value === null || Number.isNaN(value)) {
			return '-';
		} else {
			return fn(value, digits);
		}
	};
}

export const formatNumber = formatNumberBase((v, d) => v.toFixed(d));
export const formatPercent = formatNumberBase((v, d) => `${(v * 100).toFixed(d)}%`);
