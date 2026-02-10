export type Builtin =
	| { type: 'reference'; value: Value; doc?: string; category?: string }
	| {
			type: 'function';
			args: number;
			argNames?: string[];
			func: (args: Value[]) => Value;
			doc?: string;
			category?: string;
	  };

export type Builtins = Record<string, Builtin>;

export type Value = (t: number) => number;

export type BuiltinDoc = {
	name: string;
	args?: number;
	argNames?: string[];
	doc?: string;
	category?: string;
};

const toInt = (value: number, min: number) => Math.max(min, Math.round(value));

const defaultArgNames = (count: number) => ['x', 'y', 'z', 'w'].slice(0, count);

const slice = (value: Value, t: number, n: number) => {
	const k = toInt(n, 1);
	const out = new Array<number>(k);
	for (let i = 0; i < k; i += 1) {
		out[i] = value(t + i);
	}
	return out;
};

const sum = (values: number[]) => {
	let s = 0;
	for (const v of values) {
		if (!Number.isFinite(v)) return NaN;
		s += v;
	}
	return s;
};

const categories = {
	inputs: 'Inputs',
	constants: 'Constants',
	arithmetic: 'Arithmetic',
	logic: 'Logic',
	time_series: 'Time Series',
} as const;

const ref = (value: Value, doc?: string, category?: string): Builtin => ({
	type: 'reference',
	value,
	doc,
	category,
});

const map = (
	args: number,
	func: (args: number[]) => number,
	doc?: string,
	argNamesOrCategory?: string[] | string,
	category?: string,
): Builtin => ({
	type: 'function',
	args,
	func: (values) => (t) => func(values.map((v) => v(t))),
	doc,
	argNames: Array.isArray(argNamesOrCategory) ? argNamesOrCategory : undefined,
	category: Array.isArray(argNamesOrCategory) ? category : argNamesOrCategory,
});

const func = (
	args: number,
	func: (args: Value[]) => Value,
	doc?: string,
	argNamesOrCategory?: string[] | string,
	category?: string,
): Builtin => ({
	type: 'function',
	args,
	func,
	doc,
	argNames: Array.isArray(argNamesOrCategory) ? argNamesOrCategory : undefined,
	category: Array.isArray(argNamesOrCategory) ? category : argNamesOrCategory,
});

export const BUILTINS: Builtins = {
	price: ref(() => 0, 'current price', categories.inputs),
	volume: ref(() => 0, 'current volume', categories.inputs),
	open: ref(() => 0, 'current open', categories.inputs),
	close: ref(() => 0, 'current close', categories.inputs),
	high: ref(() => 0, 'current high', categories.inputs),
	low: ref(() => 0, 'current low', categories.inputs),
	time: ref((t) => t, 'sample index (0 is latest)', categories.inputs),

	random: ref(() => Math.random(), 'random number in [0, 1)', categories.constants),
	pi: ref(() => Math.PI, 'pi constant', categories.constants),
	e: ref(() => Math.E, 'euler constant', categories.constants),

	add: map(2, ([a, b]) => a + b, 'add two numbers', categories.arithmetic),
	sub: map(2, ([a, b]) => a - b, 'subtract y from x', categories.arithmetic),
	mul: map(2, ([a, b]) => a * b, 'multiply two numbers', categories.arithmetic),
	div: map(2, ([a, b]) => a / b, 'divide x by y', categories.arithmetic),
	neg: map(1, ([a]) => -a, 'negate a number', categories.arithmetic),

	lt: map(2, ([a, b]) => (a < b ? 1 : 0), 'x < y', categories.logic),
	lte: map(2, ([a, b]) => (a <= b ? 1 : 0), 'x <= y', categories.logic),
	gt: map(2, ([a, b]) => (a > b ? 1 : 0), 'x > y', categories.logic),
	gte: map(2, ([a, b]) => (a >= b ? 1 : 0), 'x >= y', categories.logic),
	eq: map(2, ([a, b]) => (a === b ? 1 : 0), 'x == y', categories.logic),
	neq: map(2, ([a, b]) => (a !== b ? 1 : 0), 'x != y', categories.logic),

	and: map(2, ([a, b]) => (a !== 0 && b !== 0 ? 1 : 0), 'logical and', categories.logic),
	or: map(2, ([a, b]) => (a !== 0 || b !== 0 ? 1 : 0), 'logical or', categories.logic),
	not: map(1, ([a]) => (a === 0 ? 1 : 0), 'logical not', categories.logic),

	abs: map(1, ([a]) => Math.abs(a), 'absolute value', categories.arithmetic),
	sign: map(1, ([a]) => Math.sign(a), 'sign of x', categories.arithmetic),
	min: map(2, ([a, b]) => Math.min(a, b), 'minimum of two numbers', categories.arithmetic),
	max: map(2, ([a, b]) => Math.max(a, b), 'maximum of two numbers', categories.arithmetic),
	clamp: map(
		3,
		([x, lo, hi]) => Math.min(Math.max(x, lo), hi),
		'clamp x to [lo, hi]',
		['x', 'lo', 'hi'],
		categories.arithmetic,
	),

	sqrt: map(1, ([a]) => Math.sqrt(a), 'square root', categories.arithmetic),
	exp: map(1, ([a]) => Math.exp(a), 'exponential', categories.arithmetic),
	log: map(1, ([a]) => Math.log(a), 'natural log', categories.arithmetic),
	pow: map(2, ([a, b]) => a ** b, 'x^y', categories.arithmetic),
	floor: map(1, ([a]) => Math.floor(a), 'round down', categories.arithmetic),
	ceil: map(1, ([a]) => Math.ceil(a), 'round up', categories.arithmetic),
	round: map(1, ([a]) => Math.round(a), 'round to nearest', categories.arithmetic),
	mod: map(2, ([a, b]) => a % b, 'x mod y', categories.arithmetic),

	sin: map(1, ([a]) => Math.sin(a), 'sine', categories.arithmetic),
	cos: map(1, ([a]) => Math.cos(a), 'cosine', categories.arithmetic),
	tan: map(1, ([a]) => Math.tan(a), 'tangent', categories.arithmetic),

	if: map(
		3,
		([c, a, b]) => (c !== 0 ? a : b),
		'if c then a else b',
		['c', 'a', 'b'],
		categories.logic,
	),

	lag: func(
		2,
		([x, n]) =>
			(t) => {
				const k = toInt(n(t), 0);
				return x(t + k);
			},
		'value lagged by n samples',
		['x', 'n'],
		categories.time_series,
	),
	diff: func(
		2,
		([x, n]) =>
			(t) => {
				const k = toInt(n(t), 0);
				return x(t) - x(t + k);
			},
		'x - lag x n',
		['x', 'n'],
		categories.time_series,
	),
	sum: func(
		2,
		([x, n]) =>
			(t) => {
				const values = slice(x, t, n(t));
				return sum(values);
			},
		'rolling sum over n samples',
		['x', 'n'],
		categories.time_series,
	),
	mean: func(
		2,
		([x, n]) =>
			(t) => {
				const values = slice(x, t, n(t));
				const s = sum(values);
				return Number.isFinite(s) ? s / values.length : NaN;
			},
		'rolling mean over n samples',
		['x', 'n'],
		categories.time_series,
	),
	stdev: func(
		2,
		([x, n]) =>
			(t) => {
				const values = slice(x, t, n(t));
				const s = sum(values);
				if (!Number.isFinite(s)) return NaN;
				const mean = s / values.length;
				let ss = 0;
				for (const v of values) {
					const d = v - mean;
					ss += d * d;
				}
				return Math.sqrt(ss / values.length);
			},
		'rolling standard deviation over n samples',
		['x', 'n'],
		categories.time_series,
	),
	rolling_min: func(
		2,
		([x, n]) =>
			(t) => {
				const values = slice(x, t, n(t));
				let m = Infinity;
				for (const v of values) {
					if (!Number.isFinite(v)) return NaN;
					if (v < m) m = v;
				}
				return m;
			},
		'rolling minimum over n samples',
		['x', 'n'],
		categories.time_series,
	),
	rolling_max: func(
		2,
		([x, n]) =>
			(t) => {
				const values = slice(x, t, n(t));
				let m = -Infinity;
				for (const v of values) {
					if (!Number.isFinite(v)) return NaN;
					if (v > m) m = v;
				}
				return m;
			},
		'rolling maximum over n samples',
		['x', 'n'],
		categories.time_series,
	),
	ema: func(
		2,
		([x, n]) =>
			(t) => {
				const k = toInt(n(t), 1);
				const alpha = 2 / (k + 1);
				let ema = x(t + k - 1);
				if (!Number.isFinite(ema)) return NaN;
				for (let i = k - 2; i >= 0; i -= 1) {
					const v = x(t + i);
					if (!Number.isFinite(v)) return NaN;
					ema = alpha * v + (1 - alpha) * ema;
				}
				return ema;
			},
		'exponential moving average over n samples',
		['x', 'n'],
		categories.time_series,
	),
	zscore: func(
		2,
		([x, n]) =>
			(t) => {
				const values = slice(x, t, n(t));
				const s = sum(values);
				if (!Number.isFinite(s)) return NaN;
				const mean = s / values.length;
				let ss = 0;
				for (const v of values) {
					const d = v - mean;
					ss += d * d;
				}
				const sd = Math.sqrt(ss / values.length);
				const curr = values[0];
				return sd === 0 ? 0 : (curr - mean) / sd;
			},
		'z-score over n samples',
		['x', 'n'],
		categories.time_series,
	),
	returns: func(
		1,
		([x]) =>
			(t) => {
				const prev = x(t + 1);
				const curr = x(t);
				return prev === 0 ? 0 : (curr - prev) / prev;
			},
		'simple return',
		['x'],
		categories.time_series,
	),
	log_returns: func(
		1,
		([x]) =>
			(t) => {
				const prev = x(t + 1);
				const curr = x(t);
				return prev === 0 ? 0 : Math.log(curr / prev);
			},
		'log return',
		['x'],
		categories.time_series,
	),
};

export function getBuiltinDocs(): BuiltinDoc[] {
	return Object.entries(BUILTINS).map(([name, builtin]) => ({
		name,
		args: builtin.type === 'function' ? builtin.args : 0,
		argNames:
			builtin.type === 'function' ? (builtin.argNames ?? defaultArgNames(builtin.args)) : [],
		doc: builtin.doc,
		category: builtin.category,
	}));
}

export function builtins(overrides?: Record<string, Value>): Builtins {
	if (!overrides) return BUILTINS;
	const wrapped: Builtins = {};
	for (const [key, value] of Object.entries(overrides)) {
		wrapped[key] = ref(value);
	}
	return { ...BUILTINS, ...wrapped };
}
