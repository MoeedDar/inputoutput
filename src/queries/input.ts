import { getInput } from '@/lib/input';

import type { Parameters } from '@/hooks/use-parameters';

export const inputKeys = {
	all: ['input'] as const,
	byParameters: (parameters: Parameters) =>
		[
			...inputKeys.all,
			parameters.input,
			parameters.frequency,
			parameters.limit,
			parameters.costs,
		] as const,
};

export function inputQuery(parameters: Parameters) {
	return {
		queryKey: inputKeys.byParameters(parameters),
		queryFn: () =>
			getInput({
				input: parameters.input,
				frequency: parameters.frequency,
				limit: parameters.limit,
				costs: parameters.costs,
			}),
		gcTime: 0,
	};
}
