import {
	getAlgorithmFn,
	getLikeStateFn,
	listLikedAlgorithmsFn,
	listMyAlgorithmsFn,
	listPublicAlgorithmsFn,
	listUserAlgorithmsFn,
	listUsersFn,
} from '@/server/fns';

export const algorithmKeys = {
	all: ['algorithm'] as const,
	byId: (id: string) => [...algorithmKeys.all, id] as const,
};

export const algorithmsKeys = {
	all: ['algorithms'] as const,
	public: () => [...algorithmsKeys.all, 'public'] as const,
	my: () => [...algorithmsKeys.all, 'my'] as const,
	liked: () => [...algorithmsKeys.all, 'liked'] as const,
	byUser: (username: string) => [...algorithmsKeys.all, 'user', username] as const,
	users: (search: string) => [...algorithmsKeys.all, 'users', search] as const,
};

export const likeKeys = {
	all: ['algorithm-like'] as const,
	byAlgorithm: (id: string) => [...likeKeys.all, id] as const,
};

export function algorithmByIdQuery(id: string) {
	return {
		queryKey: algorithmKeys.byId(id),
		queryFn: () => getAlgorithmFn({ data: { id } }),
		gcTime: 0,
	};
}

export function publicAlgorithmsQuery() {
	return {
		queryKey: algorithmsKeys.public(),
		queryFn: () => listPublicAlgorithmsFn(),
		gcTime: 0,
	};
}

export function myAlgorithmsQuery() {
	return {
		queryKey: algorithmsKeys.my(),
		queryFn: () => listMyAlgorithmsFn(),
		gcTime: 0,
	};
}

export function likedAlgorithmsQuery() {
	return {
		queryKey: algorithmsKeys.liked(),
		queryFn: () => listLikedAlgorithmsFn(),
		gcTime: 0,
	};
}

export function userAlgorithmsQuery(username: string) {
	return {
		queryKey: algorithmsKeys.byUser(username),
		queryFn: () => listUserAlgorithmsFn({ data: { username } }),
		gcTime: 0,
	};
}

export function usersQuery(search: string) {
	return {
		queryKey: algorithmsKeys.users(search),
		queryFn: () => listUsersFn({ data: { search } }),
		gcTime: 0,
	};
}

export function likeStateQuery(algorithmId: string) {
	return {
		queryKey: likeKeys.byAlgorithm(algorithmId),
		queryFn: () => getLikeStateFn({ data: { algorithmId } }),
		gcTime: 0,
	};
}
