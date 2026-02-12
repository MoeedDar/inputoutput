import { valueObject } from '@/lib/lang';

import type { EagerInput, Frequency, Input, InputParameters, Instrument } from '@/types';

export async function binance(parameters: InputParameters, instrument: Instrument): Promise<Input> {
	const eager = await fetchMarket(parameters, instrument);
	const lazy = valueObject(eager);
	return {
		id: parameters.input,
		length: eager.open.length,
		eager,
		lazy,
	};
}

const INTERVALS = {
	'1s': null,
	'5s': null,
	'10s': null,
	'15s': null,
	'30s': null,
	'1m': '1m',
	'3m': '3m',
	'5m': '5m',
	'10m': null,
	'15m': '15m',
	'30m': '30m',
	'1h': '1h',
	'2h': '2h',
	'4h': '4h',
	'6h': '6h',
	'12h': '12h',
	'1d': '1d',
	'1w': '1w',
	'1mo': '1M',
} as const;

function getBinanceInterval(frequency: Frequency) {
	return INTERVALS[frequency] ?? null;
}

function formatSymbol({ base, quote }: Instrument) {
	return `${base}${quote}`.toUpperCase();
}

async function fetchMarket(
	{ frequency, limit }: InputParameters,
	instrument: Instrument,
): Promise<EagerInput> {
	const interval = getBinanceInterval(frequency);
	const symbol = formatSymbol(instrument);
	const cappedLimit = Math.min(limit, 1000);

	const url = new URL('https://api.binance.com/api/v3/klines');
	url.searchParams.set('symbol', symbol);
	url.searchParams.set('interval', interval || '');
	url.searchParams.set('limit', String(cappedLimit));

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Failed to fetch Binance data`);
	}

	const data = await response.json();

	const price: number[] = [];
	const open: number[] = [];
	const close: number[] = [];
	const high: number[] = [];
	const low: number[] = [];
	const volume: number[] = [];

	for (const kline of data) {
		const o = Number(kline[1]);
		const h = Number(kline[2]);
		const l = Number(kline[3]);
		const c = Number(kline[4]);
		const v = Number(kline[5]);

		open.push(o);
		high.push(h);
		low.push(l);
		close.push(c);
		volume.push(v);
		price.push((h + l + c) / 3);
	}

	return {
		open,
		close,
		high,
		low,
		volume,
		price,
	};
}
