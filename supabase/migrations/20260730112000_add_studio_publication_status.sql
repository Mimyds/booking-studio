ALTER TABLE "public"."studios"
ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT false NOT NULL;

DROP POLICY IF EXISTS "Anyone can read studios"
ON "public"."studios";

DROP POLICY IF EXISTS "Anyone can read published studios"
ON "public"."studios";

CREATE POLICY "Anyone can read published studios"
ON "public"."studios"
FOR SELECT
TO "anon", "authenticated"
USING ("is_published" = true);

DROP POLICY IF EXISTS "Admins can read studios"
ON "public"."studios";

CREATE POLICY "Admins can read studios"
ON "public"."studios"
FOR SELECT
TO "authenticated"
USING ("public"."is_admin"());
