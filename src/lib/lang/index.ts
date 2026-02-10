import { BUILTINS, builtins} from '@/lib/lang/builtins';
import { format_error } from './error';
import { evaluate as evaluate_ } from './evaluate';
import { lower } from './lower';
import { parse } from './parse';
import { tokenise } from './tokenise';

import type { Value } from '@/lib/lang/builtins';
import type { LazyInput } from '@/types';
import type { Err } from './error';

export function value(
	value: number | number[] | ((...args: number[]) => number),
	...args: Value[]
): Value {
	if (typeof value === 'function') {
		return (t) => value(...args.map((arg) => arg(t)));
	} else if (Array.isArray(value)) {
		return (t) => value.at(value.length - 1 - t) || NaN;
	} else {
		return () => value;
	}
}

export function valueObject<T extends Record<string, number | number[]>>(
	obj: T,
): Record<keyof T, Value> {
	const result = {} as Record<keyof T, Value>;
	for (const key in obj) {
		result[key] = value(obj[key]);
	}
	return result;
}

export function devalue(value: Value, length: number): number[] {
	return Array.from({ length }, (_, i) => value(length - 1 - i));
}

export function evaluate(code: string, input: LazyInput) {
	try {
		const tokens = tokenise(code);
		const ast = parse(tokens);
		const ir = lower(ast, BUILTINS);
		const result = evaluate_(ir, builtins(input));
		return { result, error: undefined };
	} catch (e: Err) {
		const error = format_error(e);
		return { error, result: undefined };
	}
}

export { getDocstrings } from './docstrings';

export type { Value } from '@/lib/lang/builtins';
export type { Docstrings } from './docstrings';
