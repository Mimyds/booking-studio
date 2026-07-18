CREATE POLICY "Anyone can read studios"
ON "public"."studios"
FOR SELECT
TO "anon", "authenticated"
USING (true);

CREATE POLICY "Admins can create studios"
ON "public"."studios"
FOR INSERT
TO "authenticated"
WITH CHECK ("public"."is_admin"());
