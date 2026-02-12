import { valueObject } from '@/lib/lang';

import type { EagerInput, Frequency, Input, InputParameters, Instrument } from '@/types';

export async function coinbase(
	parameters: InputParameters,
	instrument: Instrument,
): Promise<Input> {
	const eager = await fetchMarket(parameters, instrument);
	const lazy = valueObject(eager);
	return {
		id: parameters.input,
		length: eager.open.length,
		eager,
		lazy,
	};
}

const GRANULARITIES = {
	'1s': null,
	'5s': null,
	'10s': null,
	'15s': null,
	'30s': null,
	'1m': 60,
	'3m': null,
	'5m': 300,
	'10m': null,
	'15m': 900,
	'30m': null,
	'1h': 3600,
	'2h': null,
	'4h': null,
	'6h': 21600,
	'12h': null,
	'1d': 86400,
	'1w': null,
	'1mo': null,
} as const;

function getGranularity(frequency: Frequency) {
	return GRANULARITIES[frequency] ?? null;
}

function formatSymbol({ base, quote }: Instrument) {
	return `${base}-${quote}`.toUpperCase();
}

async function fetchMarket(
	{ frequency, limit }: InputParameters,
	instrument: Instrument,
): Promise<EagerInput> {
	const granularity = getGranularity(frequency);
	if (!granularity) {
		throw new Error('Unsupported Coinbase frequency');
	}

	const symbol = formatSymbol(instrument);
	const cappedLimit = Math.min(limit, 300);
	const now = Math.floor(Date.now() / 1000);
	const spanSeconds = granularity * cappedLimit;
	const start = now - spanSeconds;

	const url = new URL(`https://api.exchange.coinbase.com/products/${symbol}/candles`);
	url.searchParams.set('granularity', String(granularity));
	url.searchParams.set('start', new Date(start * 1000).toISOString());
	url.searchParams.set('end', new Date(now * 1000).toISOString());

	const response = await fetch(url.toString(), {
		headers: {
			Accept: 'application/json',
		},
	});
	if (!response.ok) {
		throw new Error('Failed to fetch Coinbase data');
	}

	const data = (await response.json()) as Array<[number, number, number, number, number, number]>;
	data.sort((a, b) => a[0] - b[0]);

	const price: number[] = [];
	const open: number[] = [];
	const close: number[] = [];
	const high: number[] = [];
	const low: number[] = [];
	const volume: number[] = [];

	for (const candle of data) {
		const l = Number(candle[1]);
		const h = Number(candle[2]);
		const o = Number(candle[3]);
		const c = Number(candle[4]);
		const v = Number(candle[5]);

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
