import { binance } from './binance';
import { empty } from './empty';
import { synthetic } from './synthetic';

export const SOURCES = {
	binance,
	synthetic,
	empty,
} as const;
