import { runBacktest } from '@/lib/backtest';
import { evaluate } from '@/lib/lang';

import type { BacktestOutput } from '@/lib/backtest';
import type { Input, Value } from '@/types';

type Args = {
	input?: Input;
	error?: string;
	code: string;
	costs: number;
};

export function useOutput({ input, error: inputError, code, costs }: Args): {
	output?: Value;
	backtest?: BacktestOutput;
	error?: string;
} {
	const evalResult = input && evaluate(code, input.lazy);
	const output = evalResult?.result;
	const backtest = input && output ? runBacktest(input, output, costs) : undefined;
	const error = inputError || evalResult?.error || undefined;
	return {
		...(output !== undefined ? { output } : {}),
		...(backtest !== undefined ? { backtest } : {}),
		...(error !== undefined ? { error } : {}),
	};
}
