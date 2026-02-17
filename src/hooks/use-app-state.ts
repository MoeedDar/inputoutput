import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';

import { useInput } from '@/hooks/use-input';
import { useOutput } from '@/hooks/use-output';
import { useParameters } from '@/hooks/use-parameters';
import { useSession } from '@/lib/auth';
import { algorithmByIdQuery, likeStateQuery } from '@/queries/algorithm';

export function useAppState() {
	const params = useParams({ from: '/{-$id}' });
	const { parameters, code } = useParameters();
	const { data: session } = useSession();

	const algorithm = useQuery({
		...(params.id ? algorithmByIdQuery(params.id) : algorithmByIdQuery('')),
		enabled: params.id != null,
	});

	const input = useInput(parameters);

	const output = useOutput({
		...(input.data !== undefined ? { input: input.data } : {}),
		...(input.error?.message ? { error: input.error.message } : {}),
		code: parameters.code,
		costs: parameters.costs,
	});

	const isOwner =
		algorithm.data != null &&
		session?.user?.id != null &&
		algorithm.data.userId === session.user.id;

	const likeEnabled = algorithm.data?.id != null && session?.user?.id != null;
	const likeState = useQuery({
		...(algorithm.data?.id ? likeStateQuery(algorithm.data.id) : likeStateQuery('')),
		enabled: likeEnabled,
	});

	const persistedCode = algorithm.data?.code ?? code;
	const isUnchanged =
		params.id != null && persistedCode != null && parameters.code === persistedCode;

	return {
		parameters,
		code,
		session,
		algorithm: algorithm.data,
		isOwner,
		isUnchanged,
		input: input.data,
		output: output.output,
		backtest: output.backtest,
		error: output.error,
		canLike: session?.user?.id != null,
		canExplorePrivateLists: session?.user?.id != null,
		liked: likeState.data?.liked ?? false,
		likeCount: algorithm.data?.likeCount ?? 0,
	};
}
