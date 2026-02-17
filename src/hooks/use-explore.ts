import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';

import { useParameters } from '@/hooks/use-parameters';
import { useSession } from '@/lib/auth';
import { getDocstrings } from '@/lib/lang';
import {
	likedAlgorithmsQuery,
	myAlgorithmsQuery,
	publicAlgorithmsQuery,
} from '@/queries/algorithm';

export type ExploreMode = 'search' | 'mine' | 'liked';

export function useExplore() {
	const params = useParams({ from: '/{-$id}' });
	const { parameters } = useParameters();
	const { data: session } = useSession();
	const [exploreMode, setExploreMode] = useState<ExploreMode>('search');

	const publicAlgorithms = useQuery({
		...publicAlgorithmsQuery(),
		enabled: exploreMode === 'search',
	});

	const myAlgorithms = useQuery({
		...myAlgorithmsQuery(),
		enabled: exploreMode === 'mine' && session?.user?.id != null,
	});

	const likedAlgorithms = useQuery({
		...likedAlgorithmsQuery(),
		enabled: exploreMode === 'liked' && session?.user?.id != null,
	});

	const algorithmEntries =
		exploreMode === 'mine'
			? myAlgorithms.data
			: exploreMode === 'liked'
				? likedAlgorithms.data
				: publicAlgorithms.data;

	const algorithmOptions =
		algorithmEntries?.map((entry) => ({
			value: entry.id,
			label: getDocstrings(entry.code).name || entry.id,
			creatorName: entry.creatorName,
			likeCount: entry.likeCount,
			createdAt: entry.createdAt,
			visibility: entry.visibility,
		})) ?? [];

	return {
		exploreMode,
		setExploreMode,
		algorithmOptions,
		isAlgorithmsLoading:
			publicAlgorithms.isFetching || myAlgorithms.isFetching || likedAlgorithms.isFetching,
		selectedAlgorithmId: params.id ?? '',
		docstringName: getDocstrings(parameters.code).name,
	};
}
