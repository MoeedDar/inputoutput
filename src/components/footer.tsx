import { AuthControls } from '@/components/auth';

export function Footer() {
	return (
		<footer className="px-2 py-1 shrink-0 flex items-center justify-between gap-2">
			<span className="text-sm font-bold italic">inputoutput.fun</span>
			<AuthControls />
		</footer>
	);
}
