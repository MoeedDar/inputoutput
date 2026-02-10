import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/utils/css';

const toggleVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border border-transparent bg-transparent text-sm font-normal text-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-border focus-visible:outline-none focus-visible:ring-0 aria-invalid:border-destructive data-[state=on]:border-border data-[state=on]:bg-muted data-[state=on]:text-foreground",
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

function Toggle({
	className,
	variant = 'default',
	size = 'default',
	...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
	return (
		<TogglePrimitive.Root
			data-slot="toggle"
			data-variant={variant}
			data-size={size}
			className={cn(toggleVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Toggle, toggleVariants };
