import type { Builtins } from './builtins';
import { error_application, error_reference } from './error';
import type { Expression } from './parse';

export type Command =
	| { type: 'literal'; value: number }
	| { type: 'reference'; name: string }
	| { type: 'application'; name: string; args: number[] };

export const lower = (expr: Expression, builtins: Builtins) => {
	const commands: Command[] = [];

	const push = (command: Command) => commands.push(command) - 1;

	const lower_rec = (expr: Expression, scope: Map<string, number>): number => {
		switch (expr.type) {
			case 'literal':
				return push({ type: 'literal', value: expr.value });
			case 'reference': {
				const name = expr.name;
				const id = scope.get(name);
				if (id !== undefined) {
					return id;
				} else {
					throw error_reference(expr);
				}
			}
			case 'application': {
				const builtin = builtins[expr.name];
				if (!builtin) {
					throw error_reference(expr);
				}

				if (builtin.type !== 'function') {
					throw error_application(expr, 0, expr.args.length);
				}

				if (builtin.type === 'function' && expr.args.length !== builtin.args) {
					throw error_application(expr, builtin.args, expr.args.length);
				}

				const args = expr.args.map((arg) => lower_rec(arg, scope));
				return push({ type: 'application', name: expr.name, args });
			}
			case 'let': {
				const value_id = lower_rec(expr.value, scope);
				const new_scope = new Map(scope);
				new_scope.set(expr.name, value_id);
				return lower_rec(expr.body, new_scope);
			}
		}
	};

	const lower_builtlin_references = () => {
		const scope = new Map<string, number>();
		for (const [name, builtin] of Object.entries(builtins)) {
			if (builtin.type === 'reference') {
				scope.set(name, push({ type: 'reference', name }));
			}
		}
		return scope;
	};

	lower_rec(expr, lower_builtlin_references());
	return commands;
};
