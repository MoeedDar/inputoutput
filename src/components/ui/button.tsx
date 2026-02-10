import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/utils/css';

import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border border-transparent bg-transparent text-sm font-normal text-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-border focus-visible:outline-none focus-visible:ring-0 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default: 'border-border',
				destructive: 'border-destructive text-destructive',
				outline: 'border-border bg-transparent',
				secondary: 'border-border bg-muted text-muted-foreground',
				ghost: 'border-transparent bg-transparent',
				link: 'border-transparent bg-transparent underline underline-offset-4',
			},
			size: {
				default: 'h-8 px-2',
				sm: 'h-7 gap-1 px-2',
				lg: 'h-9 px-3',
				icon: 'size-8',
				'icon-sm': 'size-7',
				'icon-lg': 'size-9',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

function Button({
	className,
	variant = 'default',
	size = 'default',
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
