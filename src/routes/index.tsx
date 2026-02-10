import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { Code } from '@/components/code';
import { Layout } from '@/components/layout';
import { Output } from '@/components/output';
import { algorithms } from '@/data/algorithms';
import { runBacktest } from '@/lib/backtest';
import { getInput } from '@/lib/input';
import { evaluate } from '@/lib/lang';
import { Frequency } from '@/types';

export const Route = createFileRoute('/')({
	validateSearch: z.object({
		frequency: z.enum(Frequency).default(Frequency.H1),
		input: z.string().optional().default('synthetic'),
		limit: z.coerce.number().default(100),
		costs: z.coerce.number().default(0.005),
		code: z
			.string()
			.optional()
			.default(algorithms.find((algo) => algo.id === 'sma')?.code ?? ''),
	}),
	component: RouteComponent,
});

function useInput() {
	const search = Route.useSearch();

	const { data, error, isLoading } = useQuery({
		queryKey: [search.input, search.frequency, search.limit],
		queryFn: () => getInput(search),
		gcTime: 0,
	});

	return {
		result: data,
		error: error?.message,
		loading: isLoading,
	};
}

function useCode() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const [code, setCodeRaw] = useState(search.code ?? '');

	useEffect(() => {
		setCodeRaw(search.code ?? '');
	}, [search.code]);

	const setCode = (value: string) => {
		setCodeRaw(value);
		navigate({
			search: (prev) => ({
				...prev,
				code: value || undefined,
			}),
			replace: true,
		});
	};

	return [code, setCode] as const;
}

function RouteComponent() {
	const search = Route.useSearch();
	const [code, setCode] = useCode();
	const input = useInput();
	const output = input.result && evaluate(code, input.result.lazy);
	const backtest =
		input.result && output?.result && runBacktest(input.result, output.result, search.costs);
	const error = input.error || output?.error;

	return (
		<Layout>
			<Code value={code} onChange={setCode} />
			<Output input={input.result} output={output?.result} backtest={backtest} error={error} />
		</Layout>
	);
}
