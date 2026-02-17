import { sql } from 'drizzle-orm';
import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const visibility = pgEnum('visibility', ['public', 'unlisted', 'private']);

const nanoidCol = (length = 12) => varchar({ length });

const nanoidPk = (length = 12) =>
	nanoidCol(length)
		.$defaultFn(() => nanoid(length))
		.primaryKey();

const nanoidRef = (table: any, length = 12) =>
	table ? nanoidCol(length).references(() => table.id, { onDelete: 'cascade' }) : nanoidCol(length);

const nanoidAnyRef = (table: any, length = 12) =>
	table ? nanoidCol(length).references(table, { onDelete: 'cascade' }) : nanoidCol(length);

const timestamps = {
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => sql`now()`),
};

export const users = pgTable('users', {
	id: nanoidPk(),
	name: varchar().notNull(),
	image: varchar(),
	email: varchar().notNull().unique(),
	emailVerified: boolean().notNull().default(false),
	visibility: visibility().notNull().default('public'),
	...timestamps,
});

export const sessions = pgTable('sessions', {
	id: nanoidPk(),
	expiresAt: timestamp().notNull(),
	token: text().notNull().unique(),
	ipAddress: text(),
	userAgent: text(),
	userId: nanoidRef(users).notNull(),
	...timestamps,
});

export const accounts = pgTable('accounts', {
	id: nanoidPk(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: nanoidRef(users).notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp(),
	refreshTokenExpiresAt: timestamp(),
	scope: text(),
	password: text(),
	...timestamps,
});

export const verifications = pgTable('verifications', {
	id: nanoidPk(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp().notNull(),
	...timestamps,
});

export const algorithms = pgTable('algorithms', {
	id: nanoidPk(),
	userId: nanoidRef(users).notNull(),
	code: text().notNull(),
	visibility: visibility().notNull().default('public'),
	likeCount: integer().notNull().default(0),
	...timestamps,
});

export const likes = pgTable(
	'likes',
	{
		userId: nanoidRef(users).notNull(),
		algorithmId: nanoidRef(algorithms).notNull(),
		...timestamps,
	},
	(t) => [primaryKey({ columns: [t.userId, t.algorithmId] })],
);

export const schema = {
	users,
	sessions,
	accounts,
	verifications,
	algorithms,
	likes,
};
