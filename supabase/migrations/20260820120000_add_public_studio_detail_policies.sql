DROP POLICY IF EXISTS "Anyone can read published studio amenities"
ON "public"."studio_amenities";

CREATE POLICY "Anyone can read published studio amenities"
ON "public"."studio_amenities"
FOR SELECT
TO "anon", "authenticated"
USING (
  EXISTS (
    SELECT 1
    FROM "public"."studios" AS "s"
    WHERE "s"."id" = "studio_amenities"."studio_id"
      AND "s"."is_published" = true
  )
);

DROP POLICY IF EXISTS "Anyone can read amenities for published studios"
ON "public"."amenities";

CREATE POLICY "Anyone can read amenities for published studios"
ON "public"."amenities"
FOR SELECT
TO "anon", "authenticated"
USING (
  EXISTS (
    SELECT 1
    FROM "public"."studio_amenities" AS "sa"
    JOIN "public"."studios" AS "s"
      ON "s"."id" = "sa"."studio_id"
    WHERE "sa"."amenity_id" = "amenities"."id"
      AND "s"."is_published" = true
  )
);

DROP POLICY IF EXISTS "Anyone can read published studio experiences"
ON "public"."studio_experiences";

CREATE POLICY "Anyone can read published studio experiences"
ON "public"."studio_experiences"
FOR SELECT
TO "anon", "authenticated"
USING (
  EXISTS (
    SELECT 1
    FROM "public"."studios" AS "s"
    WHERE "s"."id" = "studio_experiences"."studio_id"
      AND "s"."is_published" = true
  )
);

DROP POLICY IF EXISTS "Anyone can read active experiences for published studios"
ON "public"."experiences";

CREATE POLICY "Anyone can read active experiences for published studios"
ON "public"."experiences"
FOR SELECT
TO "anon", "authenticated"
USING (
  "is_active" = true
  AND EXISTS (
    SELECT 1
    FROM "public"."studio_experiences" AS "se"
    JOIN "public"."studios" AS "s"
      ON "s"."id" = "se"."studio_id"
    WHERE "se"."experience_id" = "experiences"."id"
      AND "s"."is_published" = true
  )
);
