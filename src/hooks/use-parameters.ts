import { useLoaderData, useNavigate, useSearch } from '@tanstack/react-router';

import type { Frequency } from '@/types';

export type Parameters = {
	frequency: Frequency;
	input: string;
	limit: number;
	costs: number;
	code: string;
};

export function useParameters() {
	const search = useSearch({ from: '/{-$id}' });
	const navigate = useNavigate({ from: '/{-$id}' });
	const code = useLoaderData({ from: '/{-$id}' })?.code ?? null;

	const parameters: Parameters = {
		frequency: search.frequency,
		input: search.input,
		limit: search.limit,
		costs: search.costs,
		code: search.code ?? code ?? '',
	};

	const setFrequency = (value: Frequency) =>
		void navigate({ search: (prev) => ({ ...prev, frequency: value }) });

	const setInput = (value: string) =>
		void navigate({ search: (prev) => ({ ...prev, input: value }) });

	const setLimit = (value: number) =>
		void navigate({ search: (prev) => ({ ...prev, limit: value }) });

	const setCosts = (value: number) =>
		void navigate({ search: (prev) => ({ ...prev, costs: value }) });

	const setCode = (value: string) =>
		void navigate({ search: (prev) => ({ ...prev, code: value }), replace: true });

	const setAlgorithm = (value: string) =>
		void navigate({
			to: '/{-$id}',
			params: { id: value },
			search: (prev) => ({ ...prev, code: undefined }),
		});

	return {
		parameters,
		code,
		setFrequency,
		setInput,
		setLimit,
		setCosts,
		setCode,
		setAlgorithm,
	};
}
