export type Docstrings = {
	name: string;
	description?: string;
};

export const getDocstrings = (code: string): Docstrings => {
	let name = '';
	const lines = code.split(/\r?\n/);
	let nameIndex = -1;
	for (let i = 0; i < lines.length; i += 1) {
		const trimmed = lines[i].trim();
		if (trimmed.startsWith('#')) {
			const content = trimmed.replace(/^#+\s*/, '');
			if (content) {
				name = content;
				nameIndex = i;
				break;
			}
		}
	}

	let description: string | undefined;
	if (nameIndex !== -1) {
		const descLines: string[] = [];
		for (let i = nameIndex + 1; i < lines.length; i += 1) {
			const trimmed = lines[i].trim();
			if (!trimmed.startsWith('#')) {
				break;
			}
			const content = trimmed.replace(/^#+\s*/, '');
			if (content) descLines.push(content);
		}
		if (descLines.length) {
			description = descLines.join(' ');
		}
	}

	return {
		name: name || 'Algorithm',
		description,
	};
};
