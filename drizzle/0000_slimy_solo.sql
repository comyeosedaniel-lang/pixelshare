CREATE TYPE "public"."ai_tool" AS ENUM('midjourney', 'stable_diffusion', 'dall_e', 'firefly', 'leonardo', 'flux', 'other', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('character', 'landscape', 'abstract', 'architecture', 'portrait', 'sci_fi', 'fantasy', 'nature', 'concept_art', 'illustration', 'photo_realistic', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('copyright', 'illegal_content', 'spam', 'harassment', 'misleading', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'reviewing', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "image_tags" (
	"image_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"ai_tool" "ai_tool" DEFAULT 'unknown',
	"prompt" text,
	"category" "category" DEFAULT 'other',
	"original_url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"mime_type" varchar(50) NOT NULL,
	"file_size" bigint NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"sha256_hash" varchar(64) NOT NULL,
	"p_hash" varchar(64),
	"is_moderated" boolean DEFAULT false,
	"moderation_ok" boolean DEFAULT true,
	"download_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_id" uuid NOT NULL,
	"reporter_id" uuid NOT NULL,
	"reason" "report_reason" NOT NULL,
	"description" text,
	"status" "report_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_tags" ADD CONSTRAINT "image_tags_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_tags" ADD CONSTRAINT "image_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_idx" ON "accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "image_tags_pk" ON "image_tags" USING btree ("image_id","tag_id");--> statement-breakpoint
CREATE INDEX "image_tags_tag_idx" ON "image_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "images_user_idx" ON "images" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "images_sha256_idx" ON "images" USING btree ("sha256_hash");--> statement-breakpoint
CREATE INDEX "images_phash_idx" ON "images" USING btree ("p_hash");--> statement-breakpoint
CREATE INDEX "images_category_idx" ON "images" USING btree ("category");--> statement-breakpoint
CREATE INDEX "images_created_idx" ON "images" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reports_image_idx" ON "reports" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_idx" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_tokens_pk" ON "verification_tokens" USING btree ("identifier","token");