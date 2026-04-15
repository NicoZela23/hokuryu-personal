CREATE TABLE "onboarding_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"source_types" text[],
	"content_formats" text[],
	"genres" text[],
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "content_format" text;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "platform" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "onboarding_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "onboarding_preferences" ADD CONSTRAINT "onboarding_preferences_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "items_content_format_idx" ON "items" USING btree ("content_format");--> statement-breakpoint
CREATE INDEX "items_platform_idx" ON "items" USING btree ("platform");