ALTER TABLE "public"."addons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."experiences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."studio_addons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."studio_experiences" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can CRUD add-ons"
ON "public"."addons";

CREATE POLICY "Admin can CRUD add-ons"
ON "public"."addons"
FOR ALL
TO "authenticated"
USING ((SELECT "public"."is_admin"()))
WITH CHECK ((SELECT "public"."is_admin"()));

DROP POLICY IF EXISTS "Admin can create experiences"
ON "public"."experiences";

CREATE POLICY "Admin can create experiences"
ON "public"."experiences"
FOR INSERT
TO "authenticated"
WITH CHECK ((SELECT "public"."is_admin"()));

DROP POLICY IF EXISTS "Admin can read experiences"
ON "public"."experiences";

CREATE POLICY "Admin can read experiences"
ON "public"."experiences"
FOR SELECT
TO "authenticated"
USING ((SELECT "public"."is_admin"()));

DROP POLICY IF EXISTS "Admin can update experiences"
ON "public"."experiences";

CREATE POLICY "Admin can update experiences"
ON "public"."experiences"
FOR UPDATE
TO "authenticated"
USING ((SELECT "public"."is_admin"()))
WITH CHECK ((SELECT "public"."is_admin"()));

DROP POLICY IF EXISTS "Admin can delete experiences"
ON "public"."experiences";

CREATE POLICY "Admin can delete experiences"
ON "public"."experiences"
FOR DELETE
TO "authenticated"
USING ((SELECT "public"."is_admin"()));

DROP POLICY IF EXISTS "Admin can create studio addon"
ON "public"."studio_addons";

CREATE POLICY "Admin can create studio addon"
ON "public"."studio_addons"
FOR INSERT
TO "authenticated"
WITH CHECK ((SELECT "public"."is_admin"()));

DROP POLICY IF EXISTS "Admin can read studio addons"
ON "public"."studio_addons";

CREATE POLICY "Admin can read studio addons"
ON "public"."studio_addons"
FOR SELECT
TO "authenticated"
USING ((SELECT "public"."is_admin"()));

DROP POLICY IF EXISTS "Admin can delete studio addon"
ON "public"."studio_addons";

CREATE POLICY "Admin can delete studio addon"
ON "public"."studio_addons"
FOR DELETE
TO "authenticated"
USING ((SELECT "public"."is_admin"()));

DROP POLICY IF EXISTS "Admin can create studio experience"
ON "public"."studio_experiences";

CREATE POLICY "Admin can create studio experience"
ON "public"."studio_experiences"
FOR INSERT
TO "authenticated"
WITH CHECK ((SELECT "public"."is_admin"()));

DROP POLICY IF EXISTS "Admin can read studio addons"
ON "public"."studio_experiences";

CREATE POLICY "Admin can read studio addons"
ON "public"."studio_experiences"
FOR SELECT
TO "authenticated"
USING ((SELECT "public"."is_admin"()));

DROP POLICY IF EXISTS "Admin can delete studio addon"
ON "public"."studio_experiences";

CREATE POLICY "Admin can delete studio addon"
ON "public"."studio_experiences"
FOR DELETE
TO "authenticated"
USING ((SELECT "public"."is_admin"()));
