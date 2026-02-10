import type { Builtins, Value } from './builtins';
import type { Command } from './lower';

export const evaluate = (commands: Command[], builtins: Builtins): Value => {
	const values: Value[] = new Array(commands.length);

	for (let i = 0; i < commands.length; i++) {
		const cmd = commands[i];

		switch (cmd.type) {
			case 'literal': {
				values[i] = () => cmd.value;
				break;
			}

			case 'reference': {
				const builtin = builtins[cmd.name];
				if (builtin.type === 'reference') {
					values[i] = builtin.value;
				}
				break;
			}

			case 'application': {
				const builtin = builtins[cmd.name];
				if (builtin.type === 'function') {
					const args = cmd.args.map((id) => values[id]);
					values[i] = builtin.func(args);
				}
				break;
			}
		}
	}

	return values[values.length - 1];
};
