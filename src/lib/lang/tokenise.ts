import { error_character } from './error';

import type { WithSpan } from './span';
import type { OfType, TypeOf } from './types';

export type TokenOf<T extends TokenType> = OfType<Token, T>;
export type TokenType = TypeOf<Token>;
export type Token = WithSpan<
	| { type: 'literal'; value: number }
	| { type: 'reference'; name: string }
	| { type: '(' | ')' | '=' | '|>' | 'let' | 'in' }
	| { type: 'eof' }
>;

const not = (fn: (c: string) => boolean) => (c: string) => !fn(c);
const is_space = (c: string) => c === ' ' || c === '\t' || c === '\n' || c === '\r';
const is_digit = (c: string) => c >= '0' && c <= '9';
const is_alpha = (c: string) => (c >= 'a' && c <= 'z') || c === '_';
const is_alnum = (c: string) => is_alpha(c) || is_digit(c);
const is_sign = (c: string) => c === '+' || c === '-';
const is_exp = (c: string) => c === 'e' || c === 'E';
const is_dot = (c: string) => c === '.';
const is_simple = (c: string) => c === '(' || c === ')' || c === '=';
const is_comment_start = (c: string) => c === '#';
const is_comment_end = (c: string) => c === '\n' || c === '\r' || c === '';
const is_pipeline = (c1: string, c2: string) => c1 === '|' && c2 === '>';

export const tokenise = (src: string): Token[] => {
	const tokens: Token[] = [];

	for (let i = 0; i < src.length; ) {
		const char = src[i];
		const start = i;

		const at = (i: number) => src.at(i) || '';
		const make = (type: TokenType, rest?: Partial<Token>) => ({ type, start, end: i, ...rest });
		const push = (type: TokenType, rest?: Partial<Token>) => tokens.push(make(type, rest) as Token);
		const cond = <T>(pred: (c: string) => boolean, fn: () => T) => (pred(at(i)) ? fn() : '');
		const peek = () => at(i);
		const take = () => at(i++);
		const take_if = (pred: (c: string) => boolean) => cond(pred, take);
		const take_while = (pred: (c: string) => boolean) => {
			let text = '';
			while (pred(peek())) {
				text += take();
			}
			return text;
		};

		const skip_comment = () => take_while(not(is_comment_end));

		const read_simple = (length: number) => {
			i += length;
			push(src.slice(start, start + length) as TokenType);
		};

		const read_identifier = () => {
			const name = take_while(is_alnum);
			switch (name) {
				case 'let':
				case 'in':
					push(name);
					break;
				default:
					push('reference', { name });
			}
		};

		const read_number = () => {
			const sign = take_if(is_sign);
			const integer = take_while(is_digit);
			const decimal = cond(is_dot, () => take_if(is_dot) + take_while(is_digit));
			const exponent = cond(
				is_exp,
				() => take_if(is_exp) + take_if(is_sign) + take_while(is_digit),
			);
			push('literal', { value: +(sign + integer + decimal + exponent) });
		};

		if (is_space(char)) {
			take();
		} else if (is_comment_start(char)) {
			take();
			skip_comment();
		} else if (is_simple(char)) {
			read_simple(1);
		} else if (is_pipeline(char, src[i + 1])) {
			read_simple(2);
		} else if (is_alpha(char)) {
			read_identifier();
		} else if (is_digit(char) || is_dot(char) || is_sign(char)) {
			read_number();
		} else {
			throw error_character(char, i);
		}
	}

	return tokens;
};
