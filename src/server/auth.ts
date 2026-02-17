import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { nanoid } from 'nanoid';

import { db } from '@/server/db';
import { env } from '@/server/env';
import { schema } from '@/server/schema';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema,
		usePlural: true,
	}),
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		database: {
			generateId: () => nanoid(12),
		},
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID!,
			clientSecret: env.GOOGLE_CLIENT_SECRET!,
		},
	},
	plugins: [tanstackStartCookies()],
});
