import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function colour(ref: string, fallback = 'hsl(0 0% 0%)') {
	if (typeof window === 'undefined') return fallback;
	const computed = getComputedStyle(document.documentElement).getPropertyValue(ref).trim();
	return computed || fallback;
}
