import { useMemo } from 'react';

import { getBuiltinDocs } from '@/lib/lang/builtins';

type HelpProps = {
	className?: string;
};

export function Help({ className }: HelpProps) {
	const builtinDocs = useMemo(() => getBuiltinDocs(), []);
	const groups = useMemo(() => {
		const grouped = new Map<string, typeof builtinDocs>();
		for (const doc of builtinDocs) {
			const category = doc.category ?? 'Other';
			const group = grouped.get(category);
			if (group) {
				group.push(doc);
			} else {
				grouped.set(category, [doc]);
			}
		}
		return Array.from(grouped, ([title, items]) => ({ title, items }));
	}, [builtinDocs]);
	const signature = (name: string, argNames?: string[]) => {
		if (!argNames || argNames.length === 0) return name;
		return `${name} ${argNames.join(' ')}`;
	};

	return (
		<section
			className={`px-2 text-xs text-muted-foreground space-y-3 h-[calc(100vh-250px)] overflow-y-auto ${className ?? ''}`}
		>
			<div className="text-foreground font-semibold">What This Is</div>
			<div className="text-foreground/80">
				Write a formula that outputs a position each sample. Positive = buy, negative = sell, size
				is magnitude. The final expression is the output.
			</div>
			<div className="text-foreground font-semibold">Language</div>
			<div className="text-foreground/80 space-y-1">
				<div>Numbers and names are the building blocks.</div>
				<div>Function calls use spaces: `add price 1`.</div>
				<div>
					Pipeline passes left into right: `price |{'>'} add 1 |{'>'} mul 2`.
				</div>
				<div>Let binds a name: `let x = price in add x 1`.</div>
				<div>Parentheses only group: `add (mul price 2) 1`.</div>
			</div>
			<div className="text-foreground font-semibold">Builtins</div>
			<div className="space-y-3">
				{groups.map((g) => (
					<div key={g.title} className="space-y-1">
						<div className="text-foreground/90">{g.title}</div>
						<div className="grid gap-1">
							{g.items.map((item) => (
								<div key={item?.name} className="flex items-baseline gap-2">
									<span className="font-mono text-foreground">
										{signature(item?.name ?? '', item?.argNames)}
									</span>
									<span>{item?.doc ?? ''}</span>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
