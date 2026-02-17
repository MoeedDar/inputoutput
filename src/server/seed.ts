import { eq, sql } from 'drizzle-orm';

import { algorithms as presets } from '@/data/algorithms';
import { db } from '@/server/db';
import { algorithms, users } from '@/server/schema';

const SEED_USER = {
	name: 'inputoutput',
	email: 'root@inputoutput.fun',
};

async function seedAlgorithms() {
	await db.execute(sql`
		ALTER TABLE "algorithms"
		ADD COLUMN IF NOT EXISTS "like_count" integer NOT NULL DEFAULT 0;
	`);

	await db.execute(sql`
		DO $$
		BEGIN
			IF EXISTS (
				SELECT 1
				FROM information_schema.columns
				WHERE table_name = 'algorithms' AND column_name = 'likeCount'
			) THEN
				EXECUTE '
					UPDATE "algorithms"
					SET "like_count" = COALESCE("like_count", 0) + COALESCE("likeCount", 0)
				';
				EXECUTE 'ALTER TABLE "algorithms" DROP COLUMN "likeCount"';
			END IF;
		END
		$$;
	`);

	await db.execute(sql`
		UPDATE "algorithms" AS a
		SET "like_count" = agg.count
		FROM (
			SELECT "algorithm_id", COUNT(*)::integer AS count
			FROM "likes"
			GROUP BY "algorithm_id"
		) AS agg
		WHERE a.id = agg."algorithm_id";
	`);

	await db.execute(sql`
		UPDATE "algorithms"
		SET "like_count" = 0
		WHERE "like_count" IS NULL;
	`);

	await db.execute(sql`
		CREATE OR REPLACE FUNCTION update_algorithm_like_count()
		RETURNS TRIGGER
		LANGUAGE plpgsql
		AS $$
			BEGIN
				IF TG_OP = 'INSERT' THEN
					UPDATE "algorithms"
					SET "like_count" = "like_count" + 1
					WHERE id = NEW."algorithm_id";
					RETURN NEW;
				ELSIF TG_OP = 'DELETE' THEN
					UPDATE "algorithms"
					SET "like_count" = GREATEST("like_count" - 1, 0)
					WHERE id = OLD."algorithm_id";
					RETURN OLD;
				END IF;
				RETURN NULL;
		END;
		$$;
	`);

	await db.execute(sql`
		DROP TRIGGER IF EXISTS likes_count_update ON "likes";
	`);

	await db.execute(sql`
		CREATE TRIGGER likes_count_update
		AFTER INSERT OR DELETE ON "likes"
		FOR EACH ROW
		EXECUTE FUNCTION update_algorithm_like_count();
	`);

	await db
		.insert(users)
		.values({
			name: SEED_USER.name,
			email: SEED_USER.email,
			emailVerified: true,
			visibility: 'public',
		})
		.onConflictDoNothing({ target: users.email });

	const [seedUser] = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, SEED_USER.email))
		.limit(1);

	if (!seedUser) {
		throw new Error('Failed to create/load seed user.');
	}

	const existing = await db
		.select({ code: algorithms.code })
		.from(algorithms)
		.where(eq(algorithms.userId, seedUser.id));

	const existingCodes = new Set(existing.map((row) => row.code));
	const toInsert = presets
		.filter((preset) => !existingCodes.has(preset.code))
		.map((preset) => ({
			userId: seedUser.id,
			code: preset.code,
			visibility: 'public' as const,
		}));

	if (toInsert.length > 0) {
		await db.insert(algorithms).values(toInsert);
	}

	console.info(
		`Seed complete. total_presets=${presets.length} inserted=${toInsert.length} existing=${existing.length}`,
	);
}

void seedAlgorithms().catch((error: unknown) => {
	console.error('Algorithm seeding failed:', error);
	process.exit(1);
});
