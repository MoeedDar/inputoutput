import * as React from 'react';

import { cn } from '@/utils/css';

type NumberInputProps = Omit<React.ComponentPropsWithoutRef<'input'>, 'value' | 'onChange'> & {
	label?: string;
	labelClassName?: string;
	wrapperClassName?: string;
	value: number;
	onValueChange?: (value: number) => void;
	fallbackValue?: number;
};

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
	(
		{
			className,
			label,
			labelClassName,
			wrapperClassName,
			style,
			value,
			min,
			max,
			onBlur,
			onValueChange,
			fallbackValue,
			...props
		},
		ref,
	) => {
		const [draft, setDraft] = React.useState(String(value));
		React.useEffect(() => {
			setDraft(String(value));
		}, [value]);

		const clamp = React.useCallback(
			(raw: number) => {
				const minValue = typeof min === 'number' ? min : Number.NEGATIVE_INFINITY;
				const maxValue = typeof max === 'number' ? max : Number.POSITIVE_INFINITY;
				return Math.min(maxValue, Math.max(minValue, raw));
			},
			[max, min],
		);

		const inputStyle = label
			? { ...style, paddingLeft: `calc(${label.length + 1}ch + 0.75rem)` }
			: style;

		return (
			<div className={cn('relative', wrapperClassName)}>
				{label ? (
					<span
						className={cn(
							'pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-sm px-2 text-muted-foreground',
							labelClassName,
						)}
					>
						{label}
					</span>
				) : null}
				<input
					ref={ref}
					type="number"
					inputMode="decimal"
					data-slot="number-input"
					value={draft}
					min={min}
					max={max}
					onChange={(event) => {
						const nextDraft = event.currentTarget.value;
						setDraft(nextDraft);
						const raw = Number(nextDraft);
						if (Number.isFinite(raw)) {
							onValueChange?.(clamp(raw));
						}
					}}
					onBlur={(event) => {
						const raw = Number(draft);
						const fallback = fallbackValue ?? (typeof min === 'number' ? min : 0);
						const next = Number.isFinite(raw) ? clamp(raw) : fallback;
						setDraft(String(next));
						onValueChange?.(next);
						onBlur?.(event);
					}}
					className={cn(
						'flex h-8 w-full rounded-none bg-transparent px-2 text-sm text-foreground shadow-none placeholder:text-muted-foreground hover:bg-accent/30 focus-visible:border-border focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
						className,
					)}
					style={inputStyle}
					{...props}
				/>
			</div>
		);
	},
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
