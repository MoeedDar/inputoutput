import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router';

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { head } from '@/data/head';

import type { QueryClient } from '@tanstack/react-query';

interface RouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	head,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="dark">
			<head>
				<HeadContent />
			</head>
			<body className="h-screen flex flex-col">
				<Header />
				<main className="grow pb-16 md:pb-0">{children}</main>
				<Footer />
				<Scripts />
			</body>
		</html>
	);
}
