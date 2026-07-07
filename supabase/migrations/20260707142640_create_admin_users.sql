CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" PRIMARY KEY REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    "email" "text" NOT NULL UNIQUE,
    "full_name" "text",
    "role" "text" DEFAULT 'admin'::"text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" REFERENCES "auth"."users"("id") ON DELETE SET NULL,
    "updated_by" "uuid" REFERENCES "auth"."users"("id") ON DELETE SET NULL,
    CONSTRAINT "admin_users_role_check" CHECK ("role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))
);

COMMENT ON TABLE "public"."admin_users" IS 'Liste des utilisateurs Supabase Auth autorisés à accéder à l’administration.';
COMMENT ON COLUMN "public"."admin_users"."id" IS 'Identifiant auth.users de l’administrateur.';
COMMENT ON COLUMN "public"."admin_users"."role" IS 'owner peut gérer les administrateurs ; admin a accès à l’administration.';

CREATE OR REPLACE FUNCTION "public"."is_admin"()
RETURNS boolean
LANGUAGE "sql"
STABLE
SECURITY DEFINER
SET "search_path" = "public"
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION "public"."is_admin_owner"()
RETURNS boolean
LANGUAGE "sql"
STABLE
SECURITY DEFINER
SET "search_path" = "public"
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
      AND role = 'owner'
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION "public"."set_admin_users_updated_at"()
RETURNS trigger
LANGUAGE "plpgsql"
SET "search_path" = "public"
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "set_admin_users_updated_at" ON "public"."admin_users";
CREATE TRIGGER "set_admin_users_updated_at"
BEFORE UPDATE ON "public"."admin_users"
FOR EACH ROW
EXECUTE FUNCTION "public"."set_admin_users_updated_at"();

ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active admins can read admin users"
ON "public"."admin_users"
FOR SELECT
TO "authenticated"
USING ("public"."is_admin"());

CREATE POLICY "Owners can create admin users"
ON "public"."admin_users"
FOR INSERT
TO "authenticated"
WITH CHECK ("public"."is_admin_owner"());

CREATE POLICY "Owners can update admin users"
ON "public"."admin_users"
FOR UPDATE
TO "authenticated"
USING ("public"."is_admin_owner"())
WITH CHECK ("public"."is_admin_owner"());

CREATE POLICY "Owners can delete admin users"
ON "public"."admin_users"
FOR DELETE
TO "authenticated"
USING ("public"."is_admin_owner"());

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";

REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."is_admin_owner"() FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."set_admin_users_updated_at"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."is_admin_owner"() TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."is_admin"() TO "service_role";
GRANT EXECUTE ON FUNCTION "public"."is_admin_owner"() TO "service_role";
