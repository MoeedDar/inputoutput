import { valueObject } from '@/lib/lang';

import type { Input, InputParameters } from '@/types';

export function empty({ input, limit }: InputParameters): Input {
	const value = Array(limit).fill(0);
	const eager = {
		price: value,
		volume: value,
		open: value,
		close: value,
		high: value,
		low: value,
	};
	const lazy = valueObject(eager);

	return {
		id: input,
		length: limit,
		eager,
		lazy,
	};
}
