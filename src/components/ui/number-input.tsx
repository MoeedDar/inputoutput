import * as React from 'react';

import { cn } from '@/utils/css';

type NumberInputProps = React.ComponentPropsWithoutRef<'input'> & {
	label?: string;
	labelClassName?: string;
	wrapperClassName?: string;
};

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
	({ className, label, labelClassName, wrapperClassName, style, ...props }, ref) => {
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
					className={cn(
						'flex h-8 w-full rounded-none bg-transparent px-2 pr-6 text-sm text-foreground shadow-none placeholder:text-muted-foreground hover:bg-accent/30 focus-visible:border-border focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
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
