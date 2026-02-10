import { valueObject } from '@/lib/lang';
import type { EagerInput, Input, InputParameters } from '@/types';

export async function synthetic(parameters: InputParameters): Promise<Input> {
	const eager = simulateMarket(parameters);
	const lazy = valueObject(eager);
	return {
		id: parameters.input,
		length: parameters.limit,
		eager,
		lazy,
	};
}

function simulateMarket({ input, limit }: InputParameters): EagerInput {
	const seed = hashSeed(input);
	const rand = lcg(seed);

	const price: number[] = [];
	const close: number[] = [];
	const open: number[] = [];
	const high: number[] = [];
	const low: number[] = [];
	const volume: number[] = [];

	let lastClose = 100;

	for (let i = 0; i < limit; i += 1) {
		const drift = (rand() - 0.5) * 0.01;
		const nextClose = Math.max(0.1, lastClose * (1 + drift));
		const nextOpen = lastClose;
		const swing = Math.abs((rand() - 0.5) * 0.02);
		const nextHigh = Math.max(nextOpen, nextClose) * (1 + swing);
		const nextLow = Math.min(nextOpen, nextClose) * (1 - swing);
		const nextVolume = 800 + rand() * 600;
		const nextPrice = (nextHigh + nextLow + nextClose) / 3;

		price.push(nextPrice);
		open.push(nextOpen);
		close.push(nextClose);
		high.push(nextHigh);
		low.push(nextLow);
		volume.push(nextVolume);

		lastClose = nextClose;
	}

	return { open, close, high, low, volume, price };
}

function hashSeed(value: string) {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i += 1) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

function lcg(seed: number) {
	let state = seed >>> 0;
	return () => {
		state = (1664525 * state + 1013904223) >>> 0;
		return state / 0x100000000;
	};
}
