import type { Value } from '@/lib/lang';
import type { SOURCES } from '@/lib/sources';

export type { Value } from '@/lib/lang';

export type InputParameters = {
	input: string;
	frequency: Frequency;
	limit: number;
	costs: number;
};

export type Input = {
	id: string;
	length: number;
	lazy: LazyInput;
	eager: EagerInput;
};

export type EagerInput = {
	price: number[];
	volume: number[];
	open: number[];
	close: number[];
	high: number[];
	low: number[];
};

export type LazyInput = {
	price: Value;
	volume: Value;
	open: Value;
	close: Value;
	high: Value;
	low: Value;
};

export type Instrument = {
	venue: keyof typeof SOURCES;
	type: string;
	base: string;
	quote: string;
	expiry: number | undefined;
};

export enum Frequency {
	S1 = '1s',
	S5 = '5s',
	S10 = '10s',
	S15 = '15s',
	S30 = '30s',
	M1 = '1m',
	M3 = '3m',
	M5 = '5m',
	M10 = '10m',
	M15 = '15m',
	M30 = '30m',
	H1 = '1h',
	H2 = '2h',
	H4 = '4h',
	H6 = '6h',
	H12 = '12h',
	D1 = '1d',
	W1 = '1w',
	MO1 = '1mo',
}
