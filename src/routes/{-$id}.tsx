import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { Code } from '@/components/code';
import { Layout } from '@/components/layout';
import { Output } from '@/components/output';
import { algorithmByIdQuery } from '@/queries/algorithm';
import { Frequency } from '@/types';

export const Route = createFileRoute('/{-$id}')({
	validateSearch: z.object({
		frequency: z.enum(Frequency).default(Frequency.H1),
		input: z.string().optional().default('synthetic'),
		limit: z.coerce.number().default(100),
		costs: z.coerce.number().default(0.005),
		code: z.string().optional(),
	}),
	loader: async ({ context, params }) => {
		if (!params.id) {
			return { code: null };
		}

		try {
			const algorithm = await context.queryClient.ensureQueryData(algorithmByIdQuery(params.id));
			return { code: algorithm?.code ?? null };
		} catch {
			return { code: null };
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Layout>
			<Code />
			<Output />
		</Layout>
	);
}
