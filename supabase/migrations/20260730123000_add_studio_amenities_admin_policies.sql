CREATE POLICY "Admins can read amenities"
ON "public"."amenities"
FOR SELECT
TO "authenticated"
USING ("public"."is_admin"());

CREATE POLICY "Admins can create amenities"
ON "public"."amenities"
FOR INSERT
TO "authenticated"
WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins can read studio amenities"
ON "public"."studio_amenities"
FOR SELECT
TO "authenticated"
USING ("public"."is_admin"());

CREATE POLICY "Admins can create studio amenities"
ON "public"."studio_amenities"
FOR INSERT
TO "authenticated"
WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins can delete studio amenities"
ON "public"."studio_amenities"
FOR DELETE
TO "authenticated"
USING ("public"."is_admin"());
