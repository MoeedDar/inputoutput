import { binance } from './binance';
import { coinbase } from './coinbase';
import { empty } from './empty';
import { synthetic } from './synthetic';

export const SOURCES = {
	binance,
	coinbase,
	synthetic,
	empty,
} as const;
