import { signIn, signOut, useSession } from '@/lib/auth';

type AuthProvider = 'google' | 'github' | 'apple';

const providers: { id: AuthProvider; label: string }[] = [
	{ id: 'google', label: 'Google' },
	// { id: 'github', label: 'GitHub' },
	// { id: 'apple', label: 'Apple' },
];

export function AuthControls() {
	const { data } = useSession();
	const name = data?.user?.name || 'user';

	if (data?.user) {
		return (
			<div className="flex items-center gap-2 text-sm font-bold">
				<span>Welcome {name}</span>
				&middot;
				<button
					type="button"
					className="underline-offset-2 hover:underline"
					onClick={() => {
						void signOut();
					}}
				>
					Sign out
				</button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2 text-xs font-bold">
			<span>Sign in with</span>
			{providers.map((provider) => (
				<button
					key={provider.id}
					type="button"
					className="underline-offset-2 hover:underline"
					onClick={() => {
						void signIn.social({ provider: provider.id });
					}}
				>
					{provider.label}
				</button>
			))}
		</div>
	);
}
