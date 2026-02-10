import { error_token } from './error';
import type { Span, WithSpan } from './span';
import type { Token, TokenOf, TokenType } from './tokenise';
import type { OfType, TypeOf } from './types';

export type ExpressionOf<T extends ExpressionType> = OfType<Expression, T>;
export type ExpressionType = TypeOf<Expression>;
export type Expression = WithSpan<
	| { type: 'literal'; value: number }
	| { type: 'reference'; name: string }
	| { type: 'application'; name: string; args: Expression[] }
	| { type: 'let'; name: string; value: Expression; body: Expression }
>;

export const parse = (tokens: Token[]): Expression => {
	let i = 0;

	const EOF = { type: 'eof', start: -1, end: -1 } as const;

	const is = (type: TokenType) => peek().type === type;
	const at = (i: number) => tokens.at(i) || EOF;
	const peek = () => at(i);
	const take = () => at(i++);
	const do_while = <T>(pred: () => boolean, fn: () => T): T[] => {
		const out = [];
		while (pred()) out.push(fn());
		return out;
	};

	const is_atomic = () => is('reference') || is('literal') || is('(');

	const merge = <T extends Omit<Expression, 'start' | 'end'>>(
		expr: T,
		a: Span,
		b: Span,
	): ExpressionOf<TypeOf<T>> =>
		({
			...expr,
			start: a.start,
			end: b.end,
		}) as unknown as ExpressionOf<TypeOf<T>>;

	const expect = <T extends TokenType>(type: T, ctx = ''): TokenOf<T> => {
		const token = take();
		if (token.type !== type) {
			throw error_token(token, type, ctx);
		} else {
			return token as TokenOf<T>;
		}
	};

	const parse_grouped = () => {
		const lparen = take();
		const expr = parse_expression();
		const rparen = expect(')');
		return merge(expr, lparen, rparen);
	};

	const parse_atoms = () => do_while(is_atomic, parse_atom);

	const parse_atom = (): Expression => {
		const token = peek();
		switch (token.type) {
			case 'reference':
			case 'literal':
				take();
				return token;
			case '(':
				return parse_grouped();
			default:
				throw error_token(peek(), 'reference, literal or "("', 'atomic expression');
		}
	};

	const parse_application = () => {
		const head = parse_atom();
		if (head.type !== 'reference') {
			return head;
		}

		const args = parse_atoms();
		if (args.length === 0) {
			return head;
		}

		const last = args[args.length - 1];
		const name = head.name;
		return merge({ type: 'application', name, args }, head, last);
	};

	const parse_pipeline = (): Expression => {
		let left = parse_application();
		while (is('|>')) {
			const pipe = take();
			const right = parse_application();
			if (right.type === 'reference') {
				const args = [left];
				const name = right.name;
				left = merge({ type: 'application', name, args }, left, right);
			} else if (right.type === 'application') {
				const args = [left, ...right.args];
				const name = right.name;
				left = merge({ type: 'application', name, args }, left, right);
			} else {
				throw error_token(pipe, 'reference or application', 'pipeline');
			}
		}
		return left;
	};

	const parse_let = () => {
		const keyword = take();
		const { name } = expect('reference', 'let expression');
		expect('=', 'let expression');
		const value = parse_expression();
		expect('in', 'let expression');
		const body = parse_expression();
		return merge({ type: 'let', name, value, body }, keyword, body);
	};

	const parse_expression = (): Expression => {
		if (is('let')) {
			return parse_let();
		} else {
			return parse_pipeline();
		}
	};

	return parse_expression();
};
