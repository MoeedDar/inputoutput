import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { and, asc, desc, eq, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/server/db';
import { algorithms, likes, users } from '@/server/schema';
import { getSessionFromRequest } from '@/server/session';

const visibilitySchema = z.enum(['public', 'unlisted', 'private']);

async function requireUserId() {
	const session = await getSessionFromRequest(getRequest());
	if (!session?.user?.id) {
		throw new Error('Unauthorized');
	}
	return session.user.id;
}

async function getOptionalUserId() {
	const session = await getSessionFromRequest(getRequest());
	return session?.user?.id ?? null;
}

export const saveFn = createServerFn({ method: 'POST' })
	.inputValidator(
		z.object({
			code: z.string(),
			visibility: visibilitySchema.default('public'),
		}),
	)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const [created] = await db
			.insert(algorithms)
			.values({
				userId,
				code: data.code,
				visibility: data.visibility,
			})
			.returning({ id: algorithms.id });

		return created;
	});

export const updateFn = createServerFn({ method: 'POST' })
	.inputValidator(
		z.object({
			id: z.string(),
			code: z.string(),
		}),
	)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const [updated] = await db
			.update(algorithms)
			.set({ code: data.code })
			.where(and(eq(algorithms.id, data.id), eq(algorithms.userId, userId)))
			.returning({ id: algorithms.id });

		if (!updated) {
			throw new Error('Not found');
		}

		return updated;
	});

export const getAlgorithmFn = createServerFn({ method: 'GET' })
	.inputValidator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		const userId = await getOptionalUserId();
		const [row] = await db
			.select({
				id: algorithms.id,
				userId: algorithms.userId,
				code: algorithms.code,
				visibility: algorithms.visibility,
				likeCount: algorithms.likeCount,
				creatorName: users.name,
				createdAt: algorithms.createdAt,
			})
			.from(algorithms)
			.innerJoin(users, eq(algorithms.userId, users.id))
			.where(eq(algorithms.id, data.id))
			.limit(1);

		if (!row) {
			throw new Error('Not found');
		}
		if (row.visibility === 'private' && row.userId !== userId) {
			throw new Error('Not found');
		}

		return row;
	});

export const listPublicAlgorithmsFn = createServerFn({ method: 'GET' }).handler(async () => {
	return await db
		.select({
			id: algorithms.id,
			userId: algorithms.userId,
			code: algorithms.code,
			visibility: algorithms.visibility,
			likeCount: algorithms.likeCount,
			creatorName: users.name,
			createdAt: algorithms.createdAt,
		})
		.from(algorithms)
		.innerJoin(users, eq(algorithms.userId, users.id))
		.where(eq(algorithms.visibility, 'public'))
		.orderBy(desc(algorithms.createdAt))
		.limit(100);
});

export const listMyAlgorithmsFn = createServerFn({ method: 'GET' }).handler(async () => {
	const userId = await requireUserId();
	return await db
		.select({
			id: algorithms.id,
			userId: algorithms.userId,
			code: algorithms.code,
			visibility: algorithms.visibility,
			likeCount: algorithms.likeCount,
			creatorName: users.name,
			createdAt: algorithms.createdAt,
		})
		.from(algorithms)
		.innerJoin(users, eq(algorithms.userId, users.id))
		.where(eq(algorithms.userId, userId))
		.orderBy(desc(algorithms.createdAt))
		.limit(100);
});

export const listLikedAlgorithmsFn = createServerFn({ method: 'GET' }).handler(async () => {
	const userId = await requireUserId();
	return await db
		.select({
			id: algorithms.id,
			userId: algorithms.userId,
			code: algorithms.code,
			visibility: algorithms.visibility,
			likeCount: algorithms.likeCount,
			creatorName: users.name,
			createdAt: algorithms.createdAt,
		})
		.from(likes)
		.innerJoin(algorithms, eq(likes.algorithmId, algorithms.id))
		.innerJoin(users, eq(algorithms.userId, users.id))
		.where(and(eq(likes.userId, userId), eq(algorithms.visibility, 'public')))
		.orderBy(desc(algorithms.createdAt))
		.limit(100);
});

export const listUserAlgorithmsFn = createServerFn({ method: 'GET' })
	.inputValidator(z.object({ username: z.string().min(1) }))
	.handler(async ({ data }) => {
		const userId = await getOptionalUserId();
		return await db
			.select({
				id: algorithms.id,
				userId: algorithms.userId,
				code: algorithms.code,
				visibility: algorithms.visibility,
				likeCount: algorithms.likeCount,
				creatorName: users.name,
				createdAt: algorithms.createdAt,
			})
			.from(algorithms)
			.innerJoin(users, eq(algorithms.userId, users.id))
			.where(
				and(
					eq(users.name, data.username),
					userId
						? sql`(${algorithms.visibility} = 'public' OR ${algorithms.userId} = ${userId})`
						: eq(algorithms.visibility, 'public'),
				),
			)
			.orderBy(desc(algorithms.createdAt))
			.limit(100);
	});

export const listUsersFn = createServerFn({ method: 'GET' })
	.inputValidator(
		z.object({
			search: z.string().optional().default(''),
		}),
	)
	.handler(async ({ data }) => {
		const search = data.search.trim();
		const where = search ? ilike(users.name, `%${search}%`) : sql`true`;
		return await db
			.select({
				name: users.name,
				createdAt: users.createdAt,
			})
			.from(users)
			.where(where)
			.orderBy(asc(users.name))
			.limit(25);
	});

export const likeFn = createServerFn({ method: 'POST' })
	.inputValidator(z.object({ algorithmId: z.string() }))
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const [existing] = await db
			.select({ userId: likes.userId })
			.from(likes)
			.where(and(eq(likes.userId, userId), eq(likes.algorithmId, data.algorithmId)))
			.limit(1);

		if (existing) {
			await db
				.delete(likes)
				.where(and(eq(likes.userId, userId), eq(likes.algorithmId, data.algorithmId)));
			const [updated] = await db
				.select({ likeCount: algorithms.likeCount })
				.from(algorithms)
				.where(eq(algorithms.id, data.algorithmId))
				.limit(1);
			return { liked: false, likeCount: updated?.likeCount ?? 0 };
		}

		await db.insert(likes).values({
			userId,
			algorithmId: data.algorithmId,
		});
		const [updated] = await db
			.select({ likeCount: algorithms.likeCount })
			.from(algorithms)
			.where(eq(algorithms.id, data.algorithmId))
			.limit(1);
		return { liked: true, likeCount: updated?.likeCount ?? 0 };
	});

export const getLikeStateFn = createServerFn({ method: 'GET' })
	.inputValidator(z.object({ algorithmId: z.string() }))
	.handler(async ({ data }) => {
		const userId = await getOptionalUserId();
		if (!userId) {
			return { liked: false };
		}

		const [existing] = await db
			.select({ userId: likes.userId })
			.from(likes)
			.where(and(eq(likes.userId, userId), eq(likes.algorithmId, data.algorithmId)))
			.limit(1);

		return { liked: existing != null };
	});

export const setVisbilityFn = createServerFn({ method: 'POST' })
	.inputValidator(
		z.object({
			id: z.string(),
			visibility: visibilitySchema,
		}),
	)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const [updated] = await db
			.update(algorithms)
			.set({ visibility: data.visibility })
			.where(and(eq(algorithms.id, data.id), eq(algorithms.userId, userId)))
			.returning({
				id: algorithms.id,
				visibility: algorithms.visibility,
			});

		if (!updated) {
			throw new Error('Not found');
		}

		return updated;
	});

export const deleteFn = createServerFn({ method: 'POST' })
	.inputValidator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const [deleted] = await db
			.delete(algorithms)
			.where(and(eq(algorithms.id, data.id), eq(algorithms.userId, userId)))
			.returning({ id: algorithms.id });

		if (!deleted) {
			throw new Error('Not found');
		}

		return deleted;
	});
