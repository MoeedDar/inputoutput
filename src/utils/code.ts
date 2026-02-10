import { StreamLanguage } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';

import { BUILTINS } from '@/lib/lang/builtins';

import type { StringStream } from '@codemirror/language';

export const theme = createTheme({
	theme: 'dark',
	settings: {
		fontFamily: 'var(--font)',
		background: 'var(--background) !important',
		foreground: 'var(--foreground)',
		caret: 'var(--foreground)',
		selection: 'color-mix(in oklch, var(--foreground) 30%, transparent)',
		selectionMatch: 'color-mix(in oklch, var(--foreground) 20%, transparent)',
		lineHighlight: 'color-mix(in oklch, var(--muted) 60%, transparent)',
		gutterBackground: 'var(--background)',
		gutterForeground: 'var(--muted-foreground)',
	},
	styles: [
		{
			tag: tags.keyword,
			color: 'color-mix(in oklch, var(--chart-1) 75%, purple)',
		},
		{
			tag: tags.literal,
			color: 'var(--foreground)',
		},
		{
			tag: tags.variableName,
			color: 'var(--foreground)',
		},
		{
			tag: tags.punctuation,
			color: 'var(--muted-foreground)',
		},
		{
			tag: tags.comment,
			color: 'var(--muted-foreground)',
		},
		{
			tag: tags.controlKeyword,
			color: 'color-mix(in oklch, var(--chart-2) 95%, white)',
		},
	],
});

export function extension() {
	return StreamLanguage.define({
		name: 'lang',
		startState: () => ({}),
		token: (stream: StringStream) => {
			if (stream.eatSpace()) return null;

			if (stream.match(/^#.*$/)) {
				return 'comment';
			}

			if (stream.match('let')) {
				return 'keyword';
			}

			if (stream.match('in')) {
				return 'keyword';
			}

			if (stream.match('|>') || stream.match(/^[()=]/)) {
				return 'punctuation';
			}

			if (stream.match(/^[a-z_][a-z0-9_]*/)) {
				const name = stream.current();
				const builtin = BUILTINS[name];
				if (builtin?.type === 'function') {
					return 'controlKeyword';
				}
				return 'reference';
			}

			if (stream.match(/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/)) {
				return 'literal';
			}

			stream.next();
			return null;
		},
	});
}
