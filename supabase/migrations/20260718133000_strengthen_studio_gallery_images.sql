ALTER TABLE "public"."studio_gallery_images"
ALTER COLUMN "studio_id" SET NOT NULL;

ALTER TABLE "public"."studio_gallery_images"
ADD COLUMN "alt_text" "text";

ALTER TABLE "public"."studio_gallery_images"
ADD CONSTRAINT "studio_gallery_images_studio_image_unique"
UNIQUE ("studio_id", "image_public_id");

ALTER TABLE "public"."studio_gallery_images"
ADD CONSTRAINT "studio_gallery_images_sort_order_check"
CHECK ("sort_order" >= 0);

CREATE INDEX "studio_gallery_images_studio_sort_idx"
ON "public"."studio_gallery_images" ("studio_id", "sort_order", "id");

CREATE POLICY "Anyone can read studio gallery images"
ON "public"."studio_gallery_images"
FOR SELECT
TO "anon", "authenticated"
USING (true);

CREATE POLICY "Admins can create studio gallery images"
ON "public"."studio_gallery_images"
FOR INSERT
TO "authenticated"
WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins can update studio gallery images"
ON "public"."studio_gallery_images"
FOR UPDATE
TO "authenticated"
USING ("public"."is_admin"())
WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins can delete studio gallery images"
ON "public"."studio_gallery_images"
FOR DELETE
TO "authenticated"
USING ("public"."is_admin"());
CREATE POLICY "Admins can update studios"
ON "public"."studios"
FOR UPDATE
TO "authenticated"
USING ("public"."is_admin"())
WITH CHECK ("public"."is_admin"());

CREATE POLICY "Admins can delete studios"
ON "public"."studios"
FOR DELETE
TO "authenticated"
USING ("public"."is_admin"());
