import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';

import { useParameters } from '@/hooks/use-parameters';
import { useSession } from '@/lib/auth';
import { algorithmKeys, algorithmsKeys, likeKeys } from '@/queries/algorithm';
import {
	deleteFn,
	likeFn,
	saveFn,
	setVisbilityFn as setVisibilityFn,
	updateFn,
} from '@/server/fns';

type Visibility = 'public' | 'unlisted' | 'private';

export function useAppActions() {
	const navigate = useNavigate({ from: '/{-$id}' });
	const params = useParams({ from: '/{-$id}' });
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const { parameters, setFrequency, setInput, setLimit, setCosts, setCode, setAlgorithm } =
		useParameters();

	const [isSaving, setIsSaving] = useState(false);
	const [isSettingVisibility, setIsSettingVisibility] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isLiking, setIsLiking] = useState(false);

	const newAlgorithm = () =>
		void navigate({
			to: '/{-$id}',
			params: { id: undefined },
			search: (prev) => ({ ...prev, code: undefined }),
		});

	const create = async (visibility: Visibility) => {
		const saved = await saveFn({
			data: {
				code: parameters.code,
				visibility,
			},
		});
		void queryClient.invalidateQueries({ queryKey: algorithmsKeys.all });
		if (saved?.id) {
			void navigate({ to: '/{-$id}', params: { id: saved.id } });
		}
	};

	const save = async (visibility: Visibility = 'private') => {
		if (!parameters.code || !session?.user) {
			return;
		}

		try {
			setIsSaving(true);
			if (params.id) {
				await updateFn({
					data: {
						id: params.id,
						code: parameters.code,
					},
				});
				queryClient.setQueryData(
					algorithmKeys.byId(params.id),
					(prev: { code?: string } | undefined) =>
						prev == null ? prev : { ...prev, code: parameters.code },
				);
				void queryClient.invalidateQueries({ queryKey: algorithmsKeys.all });
				return;
			}

			await create(visibility);
		} finally {
			setIsSaving(false);
		}
	};

	const fork = async (visibility: Visibility = 'private') => {
		if (!parameters.code || !session?.user) {
			return;
		}

		try {
			setIsSaving(true);
			await create(visibility);
		} finally {
			setIsSaving(false);
		}
	};

	const setVisibility = (visibility: Visibility) => {
		if (!params.id) return;
		void (async () => {
			try {
				setIsSettingVisibility(true);
				await setVisibilityFn({ data: { id: params.id, visibility } });
				void queryClient.invalidateQueries({ queryKey: algorithmKeys.byId(params.id) });
				void queryClient.invalidateQueries({ queryKey: algorithmsKeys.all });
			} finally {
				setIsSettingVisibility(false);
			}
		})();
	};

	const remove = () => {
		if (!params.id) return;
		void (async () => {
			try {
				setIsDeleting(true);
				await deleteFn({ data: { id: params.id } });
				void queryClient.invalidateQueries({ queryKey: algorithmsKeys.all });
				newAlgorithm();
			} finally {
				setIsDeleting(false);
			}
		})();
	};

	const toggleLike = async () => {
		if (!params.id || !session?.user?.id) return;

		try {
			setIsLiking(true);
			const result = await likeFn({ data: { algorithmId: params.id } });
			queryClient.setQueryData(likeKeys.byAlgorithm(params.id), { liked: result.liked });
			queryClient.setQueryData(
				algorithmKeys.byId(params.id),
				(prev: { likeCount?: number } | undefined) =>
					prev == null ? prev : { ...prev, likeCount: result.likeCount },
			);
			void queryClient.invalidateQueries({ queryKey: algorithmsKeys.all });
		} finally {
			setIsLiking(false);
		}
	};

	return {
		setFrequency,
		setInput,
		setLimit,
		setCosts,
		setCode,
		setAlgorithm,
		newAlgorithm,
		save,
		fork,
		setVisibility,
		remove,
		toggleLike,
		isSaving,
		isSettingVisibility,
		isDeleting,
		isLiking,
	};
}
