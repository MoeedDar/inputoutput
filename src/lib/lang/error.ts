import type { Expression } from './parse';
import type { WithSpan } from './span';
import type { Token, TokenType } from './tokenise';

export type Err = WithSpan<
	| { type: 'character'; value: string }
	| { type: 'token'; want: string; got: string; context: string }
	| { type: 'reference'; name: string }
	| { type: 'application'; name: string; want: number; got: number }
>;

export const error_character = (value: string, i: number): Err => ({
	type: 'character',
	value,
	start: i,
	end: i + 1,
});

export const error_token = (token: Token, want: TokenType | string, ctx = ''): Err => ({
	...token,
	type: 'token',
	want: String(want),
	got: token.type,
	context: ctx,
});

export const error_reference = (expr: Expression & { name: string }): Err => ({
	...expr,
	type: 'reference',
});

export const error_application = (
	expr: Expression & { name: string },
	want: number,
	got: number,
): Err => ({
	...expr,
	type: 'application',
	got,
	want,
});

export function format_error(error: Err): string {
	switch (error.type) {
		case 'character':
			return `Unexpected character '${error.value}' at position ${error.start}`;
		case 'token':
			return `Expected ${error.want} but got '${error.got}'${error.context ? ` in ${error.context}` : ''} at position ${error.start}:${error.end}`;
		case 'reference':
			return `Unknown reference '${error.name}' at position ${error.start}:${error.end}`;
		case 'application':
			return `Application on '${error.name}' expects ${error.want} argument${error.want !== 1 ? 's' : ''} but got ${error.got} at position ${error.start}:${error.end}`;
	}
}
